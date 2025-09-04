import torch
import json
import numpy as np
from torch.utils.data import Dataset, DataLoader
from transformers import (
    RobertaTokenizer, RobertaForSequenceClassification,
    AdamW, get_linear_schedule_with_warmup
)
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
from tqdm import tqdm
import matplotlib.pyplot as plt
import seaborn as sns
from config import Config

class EmergencyDataset(Dataset):
    def __init__(self, data, tokenizer, max_length=512):
        self.data = data
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        text = str(item['text'])
        label = Config.CATEGORY_TO_ID[item['label']]

        encoding = self.tokenizer(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].flatten(),
            'attention_mask': encoding['attention_mask'].flatten(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

class EmergencyClassifierTrainer:
    def __init__(self, model_name="roberta-base"):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_name = model_name
        self.tokenizer = RobertaTokenizer.from_pretrained(model_name)
        self.model = RobertaForSequenceClassification.from_pretrained(
            model_name, 
            num_labels=Config.NUM_LABELS
        ).to(self.device)

    def load_data(self):
        """Load training and validation data"""
        # Load augmented training data
        with open("data/augmented/augmented_train.json", "r") as f:
            train_data = json.load(f)
        
        with open("data/processed/val.json", "r") as f:
            val_data = json.load(f)
        
        # Create datasets
        train_dataset = EmergencyDataset(train_data, self.tokenizer, Config.MAX_LENGTH)
        val_dataset = EmergencyDataset(val_data, self.tokenizer, Config.MAX_LENGTH)
        
        # Create data loaders
        train_loader = DataLoader(
            train_dataset, 
            batch_size=Config.BATCH_SIZE, 
            shuffle=True
        )
        val_loader = DataLoader(
            val_dataset, 
            batch_size=Config.BATCH_SIZE, 
            shuffle=False
        )
        
        return train_loader, val_loader

    def train_epoch(self, train_loader, optimizer, scheduler):
        """Train for one epoch"""
        self.model.train()
        total_loss = 0
        predictions = []
        true_labels = []
        
        progress_bar = tqdm(train_loader, desc="Training")
        
        for batch in progress_bar:
            optimizer.zero_grad()
            
            input_ids = batch['input_ids'].to(self.device)
            attention_mask = batch['attention_mask'].to(self.device)
            labels = batch['labels'].to(self.device)
            
            outputs = self.model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels
            )
            
            loss = outputs.loss
            total_loss += loss.item()
            
            loss.backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            
            # Get predictions
            logits = outputs.logits
            pred_labels = torch.argmax(logits, dim=1).cpu().numpy()
            true_labels.extend(labels.cpu().numpy())
            predictions.extend(pred_labels)
            
            progress_bar.set_postfix({'loss': loss.item()})
        
        avg_loss = total_loss / len(train_loader)
        accuracy = accuracy_score(true_labels, predictions)
        
        return avg_loss, accuracy

    def validate(self, val_loader):
        """Validate the model"""
        self.model.eval()
        total_loss = 0
        predictions = []
        true_labels = []
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc="Validating"):
                input_ids = batch['input_ids'].to(self.device)
                attention_mask = batch['attention_mask'].to(self.device)
                labels = batch['labels'].to(self.device)
                
                outputs = self.model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                total_loss += outputs.loss.item()
                
                logits = outputs.logits
                pred_labels = torch.argmax(logits, dim=1).cpu().numpy()
                true_labels.extend(labels.cpu().numpy())
                predictions.extend(pred_labels)
        
        avg_loss = total_loss / len(val_loader)
        accuracy = accuracy_score(true_labels, predictions)
        precision, recall, f1, _ = precision_recall_fscore_support(
            true_labels, predictions, average='weighted'
        )
        
        return avg_loss, accuracy, precision, recall, f1, true_labels, predictions

    def train(self):
        """Main training loop"""
        print(f"Training on device: {self.device}")
        
        # Load data
        train_loader, val_loader = self.load_data()
        
        # Setup optimizer and scheduler
        optimizer = AdamW(self.model.parameters(), lr=Config.LEARNING_RATE)
        total_steps = len(train_loader) * Config.NUM_EPOCHS
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=int(0.1 * total_steps),
            num_training_steps=total_steps
        )
        
        # Training history
        train_losses = []
        val_losses = []
        train_accuracies = []
        val_accuracies = []
        
        best_val_accuracy = 0
        
        for epoch in range(Config.NUM_EPOCHS):
            print(f"\nEpoch {epoch + 1}/{Config.NUM_EPOCHS}")
            print("-" * 30)
            
            # Train
            train_loss, train_acc = self.train_epoch(train_loader, optimizer, scheduler)
            
            # Validate
            val_loss, val_acc, precision, recall, f1, true_labels, predictions = self.validate(val_loader)
            
            # Save metrics
            train_losses.append(train_loss)
            val_losses.append(val_loss)
            train_accuracies.append(train_acc)
            val_accuracies.append(val_acc)
            
            print(f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.4f}")
            print(f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.4f}")
            print(f"Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")
            
            # Save best model
            if val_acc > best_val_accuracy:
                best_val_accuracy = val_acc
                self.save_model()
                print(f"New best model saved with validation accuracy: {val_acc:.4f}")
        
        # Plot training history
        self.plot_training_history(train_losses, val_losses, train_accuracies, val_accuracies)
        
        # Generate confusion matrix
        self.plot_confusion_matrix(true_labels, predictions)
        
        return train_losses, val_losses, train_accuracies, val_accuracies

    def save_model(self):
        """Save the trained model and tokenizer"""
        Config.MODEL_PATH.mkdir(parents=True, exist_ok=True)
        
        self.model.save_pretrained(Config.MODEL_PATH)
        self.tokenizer.save_pretrained(Config.TOKENIZER_PATH)
        
        # Save config
        model_config = {
            "model_name": self.model_name,
            "num_labels": Config.NUM_LABELS,
            "categories": Config.CATEGORIES,
            "max_length": Config.MAX_LENGTH
        }
        
        with open(Config.MODEL_PATH / "config.json", "w") as f:
            json.dump(model_config, f, indent=2)

    def plot_training_history(self, train_losses, val_losses, train_accs, val_accs):
        """Plot training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Loss plot
        ax1.plot(train_losses, label='Train Loss')
        ax1.plot(val_losses, label='Validation Loss')
        ax1.set_title('Training and Validation Loss')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Loss')
        ax1.legend()
        
        # Accuracy plot
        ax2.plot(train_accs, label='Train Accuracy')
        ax2.plot(val_accs, label='Validation Accuracy')
        ax2.set_title('Training and Validation Accuracy')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Accuracy')
        ax2.legend()
        
        plt.tight_layout()
        plt.savefig(Config.MODEL_DIR / 'training_history.png', dpi=300, bbox_inches='tight')
        plt.show()

    def plot_confusion_matrix(self, true_labels, predictions):
        """Plot confusion matrix"""
        cm = confusion_matrix(true_labels, predictions)
        
        plt.figure(figsize=(8, 6))
        sns.heatmap(
            cm, 
            annot=True, 
            fmt='d', 
            cmap='Blues',
            xticklabels=list(Config.CATEGORIES.values()),
            yticklabels=list(Config.CATEGORIES.values())
        )
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        plt.savefig(Config.MODEL_DIR / 'confusion_matrix.png', dpi=300, bbox_inches='tight')
        plt.show()

# Usage
if __name__ == "__main__":
    trainer = EmergencyClassifierTrainer()
    trainer.train()