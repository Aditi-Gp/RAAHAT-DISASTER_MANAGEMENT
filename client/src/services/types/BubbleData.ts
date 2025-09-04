export interface BubbleData {
    name: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    latitude: number;
    longitude: number;
    radius: number;
    sosCount: number;
}