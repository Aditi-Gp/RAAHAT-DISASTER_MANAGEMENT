import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// --- Icons ---
const IconHeartHandshake = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/>
    <path d="m18 15-2-2"/><path d="m15 18-2-2"/>
  </svg>
);

const IconPhoneCall = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    <path d="M14.05 2a9 9 0 0 1 8 7.94"/><path d="M14.05 6A5 5 0 0 1 18 10"/>
  </svg>
);

const IconShield = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

const IconMapIcon = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>
  </svg>
);

const IconFlame = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
  </svg>
);

const IconDroplets = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.09 3 12.25c0 2.22 1.8 4.05 4 4.05z"/>
    <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>
  </svg>
);

const IconSparkles = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
  </svg>
);

const IconAlertCircle = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const IconCheck = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
  </svg>
);

const IconCamera = ({ size = 20 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
    <circle cx="12" cy="13" r="3"/>
  </svg>
);

// --- Real Field Disaster Relief Photos Data ---
interface DisasterPhoto {
  id: string;
  category: 'wildfire' | 'earthquake' | 'typhoon' | 'flood' | 'medical' | 'water';
  title: string;
  tag: string;
  tagColor: 'amber' | 'rose' | 'violet' | 'cyan' | 'emerald';
  location: string;
  status: string;
  stat: string;
  imgUrl: string;
  description: string;
  actionPrompt: string;
}

const DISASTER_PHOTOS: DisasterPhoto[] = [
  {
    id: 'p-wildfire',
    category: 'wildfire',
    title: 'Forest Fire Arial Water Tanker Quench',
    tag: '🔥 Forest Fire',
    tagColor: 'amber',
    location: 'Shimla Ridge & Uttarakhand Forest Sector',
    status: 'ACTIVE AIR CONTAINMENT',
    stat: '1,420 Hectares Protected • 0 Human Loss',
    imgUrl: 'https://images.unsplash.com/photo-1599818987489-0118833b74bf?auto=format&fit=crop&w=800&q=80',
    description: 'Emergency aerial retardant tankers and specialized ground firebreaks containing high-heat ridge fires. Thermal drones guiding crews to hot spots.',
    actionPrompt: 'Request Air Tanker Support',
  },
  {
    id: 'p-earthquake',
    category: 'earthquake',
    title: 'Seismic Rubble Canine Search & Rescue',
    tag: '🏚️ Earthquake',
    tagColor: 'rose',
    location: 'Northern Faultline Zone',
    status: 'SURVIVOR EXTRACTION',
    stat: '48 Survivors Extracted • 320 Tents Erected',
    imgUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    description: 'Heavy hydraulic spreaders and acoustic listening gear extracting trapped citizens from collapsed masonry. All victims stabilized at field trauma stations.',
    actionPrompt: 'Request Search & Rescue Team',
  },
  {
    id: 'p-typhoon',
    category: 'typhoon',
    title: 'Super Cyclone Coastal Evacuation',
    tag: '🌀 Typhoon & Storm',
    tagColor: 'violet',
    location: 'Bay of Bengal Coastal Belt',
    status: 'SHELTER CORRIDORS OPEN',
    stat: '34 Storm Refuges • 18,200 Meals Served',
    imgUrl: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80',
    description: '140 km/h gale force wind mitigation with reinforced community storm shelters, standby generators, and warm emergency blanket kits.',
    actionPrompt: 'Locate Nearest Cyclone Haven',
  },
  {
    id: 'p-flood',
    category: 'flood',
    title: 'Monsoon Deluge Zodiac Fleet Operations',
    tag: '🌊 Flash Flood',
    tagColor: 'cyan',
    location: 'Assam Plains & Mumbai Coastal Inundation',
    status: 'AMPHIBIOUS EVACUATION',
    stat: '42 Zodiac Boats • 4,820 Rescued',
    imgUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80',
    description: 'Motorized inflatable boats navigating 8-foot flood waters to extract isolated families, elderly patients, and pets from submerged rooftops.',
    actionPrompt: 'Deploy Boat to My Landmark',
  },
  {
    id: 'p-medical',
    category: 'medical',
    title: 'Mobile Trauma & Pediatric Field Hospital',
    tag: '🩺 Medical Trauma',
    tagColor: 'emerald',
    location: 'Central Relief Camp Cluster',
    status: 'FREE SURGICAL TRIAGE',
    stat: '68 Medical Tents • 2,400+ Patients Treated',
    imgUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    description: 'Doctors, paramedics, and sterile ICU tents delivering mobile oxygen, burn dressings, and IV fluids at zero cost to disaster survivors.',
    actionPrompt: 'Request Paramedic Video Connect',
  },
  {
    id: 'p-water',
    category: 'water',
    title: 'Reverse Osmosis Clean Water & Rations Drop',
    tag: '💧 Potable Water Supply',
    tagColor: 'cyan',
    location: 'Eastern Delta Logistics Node',
    status: 'CONTINUOUS BOWSER DISPATCH',
    stat: '4.8M Liters Dispatched • 12K Food Bags',
    imgUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    description: 'Industrial mobile water filtration units purifying river water into safe drinking water for cut-off flood communities, preventing waterborne illness.',
    actionPrompt: 'Order Water Bowser Truck',
  },
];

// --- Custom CSS with Striking Editorial Aesthetics & Multi-Colors ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg-color:       #F2F8F7;
      --paper:          #FFFFFF;
      --primary-50:     #E8F7F5;
      --primary-100:    #CEEFEA;
      --primary-500:    #14B8A6;
      --primary-600:    #0D9488;
      --primary-700:    #0F766E;
      --primary-900:    #134E4A;
      --ink:            #0B1E1C;
      --slate:          #415B58;
      
      /* Vibrant Multi-Color Palette */
      --color-cyan:     #0284C7;
      --color-teal:     #0D9488;
      --color-emerald:  #059669;
      --color-amber:    #D97706;
      --color-rose:     #E11D48;
      --color-violet:   #7C3AED;
      
      --line:           rgba(13, 148, 136, 0.16);
    }

    * { box-sizing: border-box; }

    html, body, #root { 
      min-height: 100%; 
      margin: 0; 
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--ink);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      overflow-x: hidden;
      background-image:
        radial-gradient(55% 45% at 8% 10%, rgba(20, 184, 166, 0.14) 0%, rgba(20, 184, 166, 0) 70%),
        radial-gradient(50% 45% at 92% 18%, rgba(2, 132, 199, 0.12) 0%, rgba(2, 132, 199, 0) 70%),
        radial-gradient(45% 45% at 50% 60%, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0) 75%);
      background-attachment: fixed;
    }

    /* Distinct Editorial & Display Fonts */
    /* Exploring Fraunces (Solace & Comfort Serif) + JetBrains Mono (Precision Tactical Data) */
    .rh-font-fraunces {
      font-family: 'Fraunces', Georgia, serif;
      font-variation-settings: 'opsz' 120, 'SOFT' 60, 'WONK' 1;
      letter-spacing: -0.02em;
    }
    .rh-font-fraunces-italic {
      font-family: 'Fraunces', Georgia, serif;
      font-style: italic;
      font-weight: 400;
      font-variation-settings: 'opsz' 144, 'SOFT' 100, 'WONK' 1;
    }
    .rh-font-mono {
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.03em;
    }
    .rh-font-display {
      font-family: 'Syne', sans-serif;
      font-family: 'Fraunces', Georgia, serif;
      font-weight: 800;
      letter-spacing: -0.03em;
      font-variation-settings: 'opsz' 144, 'SOFT' 40, 'WONK' 1;
      letter-spacing: -0.025em;
    }
    .rh-font-serif {
      font-family: 'Playfair Display', Georgia, serif;
      font-family: 'Fraunces', Georgia, serif;
      font-variation-settings: 'opsz' 100, 'SOFT' 50;
    }
    .rh-font-mono {
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.05em;
    }

    /* Multi-Color Pill Badges */
    .rh-badge-cyan { background: #E0F2FE; color: #0369A1; border: 1.5px solid #7DD3FC; }
    .rh-badge-emerald { background: #ECFDF5; color: #047857; border: 1.5px solid #6EE7B7; }
    .rh-badge-amber { background: #FEF3C7; color: #B45309; border: 1.5px solid #FCD34D; }
    .rh-badge-rose { background: #FFE4E6; color: #BE123C; border: 1.5px solid #FDA4AF; }
    .rh-badge-violet { background: #F3E8FF; color: #6D28D9; border: 1.5px solid #C4B5FD; }

    /* Multi-Color In-Text Highlights */
    .rh-hi-teal {
      background: linear-gradient(120deg, #0D9488, #0284C7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .rh-hi-amber {
      background: linear-gradient(120deg, #D97706, #EF4444);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .rh-hi-green {
      background: linear-gradient(120deg, #059669, #10B981);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .rh-hi-violet {
      background: linear-gradient(120deg, #7C3AED, #2563EB);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    .rh-shadow {
      box-shadow: 0 16px 40px -12px rgba(13, 148, 136, 0.16), 0 4px 16px rgba(19, 78, 74, 0.05);
    }
    .rh-shadow-sm {
      box-shadow: 0 4px 20px -4px rgba(13, 148, 136, 0.10);
    }

    .rh-pulse-dot {
      position: relative; width: 10px; height: 10px; border-radius: 50%;
      background: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
      display: inline-block;
    }
    .rh-pulse-dot::after {
      content: ''; position: absolute; inset: -6px; border-radius: 50%;
      border: 1.5px solid #10B981;
      animation: rh-radiate 2s cubic-bezier(0.165,0.84,0.44,1) infinite;
    }
    @keyframes rh-radiate {
      0%   { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(2.4); opacity: 0; }
    }

    .rh-app { min-height: 100vh; display: flex; flex-direction: column; position: relative; }

    /* Top Emergency Alert Ribbon */
    .rh-top-ticker {
      background: linear-gradient(90deg, #0F766E, #0D9488, #0284C7, #7C3AED, #D97706);
      background-size: 200% 100%;
      animation: rh-gradient-shift 12s ease infinite;
      color: #fff; padding: 10px 24px; font-size: 13px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 14px;
      letter-spacing: 0.02em; z-index: 50; position: relative; flex-wrap: wrap;
    }
    @keyframes rh-gradient-shift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .rh-top-ticker span.tag {
      background: rgba(255, 255, 255, 0.28); padding: 3px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Header */
    .rh-header {
      padding: 18px 36px; display: flex; align-items: center; justify-content: space-between;
      background: rgba(242, 248, 247, 0.95); backdrop-filter: blur(16px);
      border-bottom: 1.5px solid var(--line); position: sticky; top: 0; z-index: 40;
    }
    .rh-brand { display: flex; align-items: center; gap: 14px; text-decoration: none; color: inherit; }
    .rh-brand-mark {
      width: 46px; height: 46px; border-radius: 14px 14px 14px 4px;
      background: linear-gradient(135deg, var(--primary-500), #0284C7);
      display: flex; align-items: center; justify-content: center;
      color: #fff; box-shadow: 0 8px 20px -4px rgba(20, 184, 166, 0.45); transform: rotate(-2deg);
    }
    .rh-brand h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.03em; color: var(--primary-900); line-height: 1; font-family: 'Syne', sans-serif; }
    .rh-brand h1 {
      margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.025em;
      color: var(--primary-900); line-height: 1; font-family: 'Fraunces', Georgia, serif;
      font-variation-settings: 'opsz' 144, 'SOFT' 80, 'WONK' 1;
    }
    .rh-brand span { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; color: var(--primary-600); text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

    /* Action Buttons */
    .rh-btn-sos {
      background: linear-gradient(135deg, #E11D48, #BE123C); color: #fff; border: none;
      padding: 12px 24px; border-radius: 999px; font-weight: 800; font-size: 14px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 8px 22px -4px rgba(225, 29, 72, 0.45);
      transition: all 0.2s ease; font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.2s ease; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em;
    }
    .rh-btn-sos:hover { transform: translateY(-2px); box-shadow: 0 12px 28px -4px rgba(225, 29, 72, 0.6); }

    .rh-btn-teal {
      background: linear-gradient(135deg, var(--primary-600), #0284C7); color: #fff; border: none;
      padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 15px; cursor: pointer;
      padding: 14px 28px; border-radius: 14px; font-weight: 800; font-size: 14.5px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 10px 26px -6px rgba(13, 148, 136, 0.45);
      transition: all 0.2s ease;
      transition: all 0.2s ease; font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em;
    }
    .rh-btn-teal:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -6px rgba(13, 148, 136, 0.55); }

    .rh-btn-outline {
      background: #FFFFFF; color: var(--primary-900); border: 1.5px solid var(--primary-200);
      padding: 13px 24px; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer;
      padding: 13px 24px; border-radius: 14px; font-weight: 700; font-size: 14px; cursor: pointer;
      display: inline-flex; align-items: center; gap: 10px; transition: all 0.2s ease;
      font-family: 'JetBrains Mono', monospace; letter-spacing: -0.02em;
    }
    .rh-btn-outline:hover { background: var(--primary-50); border-color: var(--primary-500); transform: translateY(-1px); }

    /* Hero Section */
    .rh-hero-wrap { position: relative; padding: 5vh 36px 6vh; border-bottom: 1.5px solid var(--line); }
    .rh-hero {
      position: relative; display: grid; grid-template-columns: 1.15fr 0.85fr; align-items: center; gap: 44px;
      max-width: 1280px; margin: 0 auto; width: 100%;
    }
    .rh-hero-eyebrow {
      display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700;
      color: var(--primary-700); background: var(--primary-50); border: 1.5px solid var(--primary-200);
      padding: 7px 16px; border-radius: 999px; margin-bottom: 18px; font-family: 'JetBrains Mono', monospace;
    }
    .rh-hero h2 {
      font-size: clamp(38px, 4.4vw, 64px); line-height: 1.06; letter-spacing: -0.03em;
      font-family: 'Fraunces', Georgia, serif;
      font-variation-settings: 'opsz' 144, 'SOFT' 60, 'WONK' 1;
      font-size: clamp(40px, 4.8vw, 68px); line-height: 1.04; letter-spacing: -0.025em;
      color: var(--primary-900); margin: 0 0 18px;
    }
    .rh-hero p { font-size: 18px; line-height: 1.6; color: var(--slate); max-width: 530px; margin: 0 0 28px; font-weight: 500; }
    .rh-process-section { max-width: 1280px; margin: 34px auto 0; }

    /* Action Hub Chips */
    .rh-action-hub {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 28px;
    }
    .rh-action-chip {
      background: #FFFFFF; border: 1.5px solid var(--line); border-radius: 18px; padding: 14px 16px;
      display: flex; flex-direction: column; gap: 6px; cursor: pointer; transition: all 0.2s ease;
      text-align: left;
    }
    .rh-action-chip:hover {
      border-color: var(--primary-500); transform: translateY(-3px);
      box-shadow: 0 10px 24px -6px rgba(13, 148, 136, 0.25);
    }
    .rh-action-chip strong { font-size: 14px; font-weight: 800; color: var(--primary-900); }
    .rh-action-chip span { font-size: 12px; color: var(--slate); font-weight: 500; }

    /* 4-Step Process Bar */
    .rh-process-bar {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; padding: 24px;
      background: #FFFFFF; border: 1.5px solid var(--line); border-radius: 22px; margin-bottom: 32px;
    }
    .rh-step-item { position: relative; display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 0 14px; text-align: center; }
    .rh-step-item:not(:last-child)::after {
      content: ''; position: absolute; top: 27px; left: calc(50% + 28px); width: calc(100% - 56px);
      height: 2px; background: linear-gradient(90deg, var(--primary-300), var(--primary-100));
    }
    .rh-step-visual { position: relative; z-index: 1; width: 56px; height: 56px; border-radius: 18px; display: grid; place-items: center; color: #FFFFFF; box-shadow: 0 8px 18px rgba(13, 148, 136, 0.2); }
    .rh-step-visual::before { content: ''; position: absolute; inset: -6px; border: 1px solid currentColor; border-radius: 22px; opacity: 0.22; animation: rh-step-pulse 2.4s ease-in-out infinite; }
    .rh-step-visual.signal { background: linear-gradient(145deg, #E11D48, #F97316); }
    .rh-step-visual.triage { background: linear-gradient(145deg, #7C3AED, #2563EB); animation-delay: 0.35s; }
    .rh-step-visual.deploy { background: linear-gradient(145deg, #0284C7, #0D9488); animation-delay: 0.7s; }
    .rh-step-visual.safe { background: linear-gradient(145deg, #059669, #65A30D); animation-delay: 1.05s; }
    .rh-step-label { font-size: 13px; font-weight: 800; color: var(--primary-900); }
    .rh-step-detail { font-size: 11px; color: var(--slate); }
    .rh-step-num {
      position: absolute; top: -8px; right: calc(50% - 38px); width: 22px; height: 22px; border-radius: 50%; background: var(--primary-900);
      color: var(--primary-700); font-weight: 800; font-family: 'JetBrains Mono', monospace;
      display: flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; z-index: 2; color: #FFFFFF;
    }
    @keyframes rh-step-pulse { 0%, 100% { transform: scale(0.9); opacity: 0.2; } 50% { transform: scale(1.08); opacity: 0.5; } }

    /* 3D Metaphor Centerpiece */
    .rh-metaphor-section { max-width: 1280px; margin: 20px auto 60px; padding: 0 36px; }
    .rh-metaphor-card {
      background: linear-gradient(145deg, #FFFFFF, #EBF8F6);
      border: 1.5px solid var(--line); border-radius: 30px; padding: 36px 44px;
      display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;
      position: relative; overflow: hidden;
    }
    .rh-canvas-container {
      width: 100%; height: 360px; border-radius: 24px; overflow: hidden;
      background: radial-gradient(circle at 50% 50%, #0D2D2A 0%, #051816 100%);
      position: relative; box-shadow: inset 0 2px 20px rgba(0,0,0,0.5);
    }
    .rh-extinguish-controls {
      position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 12px; z-index: 10;
    }
    .rh-btn-toggle-quench {
      color: #fff; border: none; padding: 13px 28px; border-radius: 999px;
      font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 8px;
      backdrop-filter: blur(8px); box-shadow: 0 6px 20px rgba(20, 184, 166, 0.45); transition: all 0.2s ease;
    }
    .rh-btn-toggle-quench:hover { transform: scale(1.05); }

    /* =========================================================================
       NEW SECTION: REAL DISASTER RELIEF PHOTOS GALLERY
       ========================================================================= */
    .rh-gallery-section { max-width: 1280px; margin: 0 auto 80px; padding: 0 36px; }
    .rh-gallery-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    
    .rh-filter-chips { display: flex; flex-wrap: wrap; gap: 10px; }
    .rh-filter-btn {
      padding: 8px 18px; border-radius: 999px; font-size: 13px; font-weight: 700;
      border: 1.5px solid var(--line); background: #FFFFFF; color: var(--slate);
      cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; gap: 6px;
    }
    .rh-filter-btn:hover, .rh-filter-btn.active {
      border-color: var(--primary-600); background: var(--primary-50); color: var(--primary-900);
      transform: translateY(-1px);
    }

    .rh-gallery-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
    }
    .rh-photo-card {
      background: #FFFFFF; border-radius: 24px; border: 1.5px solid var(--line);
      overflow: hidden; display: flex; flex-direction: column; cursor: pointer;
      transition: transform 0.25s ease, box-shadow 0.25s ease; position: relative;
    }
    .rh-photo-card:hover {
      transform: translateY(-5px); box-shadow: 0 20px 44px -10px rgba(13, 148, 136, 0.22);
    }
    .rh-photo-img-wrap {
      width: 100%; height: 210px; overflow: hidden; position: relative; background: #CBD5E1;
    }
    .rh-photo-img {
      width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;
    }
    .rh-photo-card:hover .rh-photo-img { transform: scale(1.06); }
    .rh-photo-status-badge {
      position: absolute; top: 14px; left: 14px; padding: 5px 12px; border-radius: 999px;
      font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.05em; backdrop-filter: blur(8px);
    }
    .rh-photo-body { padding: 20px; display: flex; flex-direction: column; flex: 1; }
    .rh-photo-body h4 { margin: 0 0 8px; font-size: 18px; font-weight: 800; color: var(--primary-900); line-height: 1.3; }
    .rh-photo-body p { margin: 0 0 16px; font-size: 13px; color: var(--slate); line-height: 1.5; flex: 1; }
    .rh-photo-stat {
      padding: 8px 12px; border-radius: 10px; background: var(--primary-50);
      font-size: 12px; font-weight: 700; color: var(--primary-900); font-family: 'JetBrains Mono', monospace;
      margin-bottom: 14px;
    }

    /* Map Section */
    .rh-map-section { max-width: 1280px; margin: 0 auto 80px; padding: 0 36px; }
    .rh-map-frame {
      position: relative; height: 500px; border-radius: 28px; background: #E6F3F1;
      border: 1.5px solid var(--line); overflow: hidden;
    }
    .leaflet-container { width: 100%; height: 100%; z-index: 1; }

    .rh-map-pin {
      position: relative; display: flex; flex-direction: column; align-items: center;
      transform: translate(-50%, -100%); cursor: pointer;
    }
    .rh-pin-badge {
      white-space: nowrap; background: #FFFFFF; color: var(--ink); font-size: 11px; font-weight: 800;
      padding: 5px 12px; border-radius: 999px; border: 2px solid var(--primary-500);
      box-shadow: 0 4px 14px rgba(0,0,0,0.16); display: flex; align-items: center; gap: 6px;
      margin-bottom: 5px; font-family: 'JetBrains Mono', monospace;
    }
    .rh-pin-badge.critical { border-color: #E11D48; color: #9F1239; background: #FFF1F2; }
    .rh-pin-badge.severe { border-color: #D97706; color: #92400E; background: #FEF3C7; }
    .rh-pin-badge.stable { border-color: #10B981; color: #065F46; background: #ECFDF5; }
    
    .rh-pin-marker {
      width: 18px; height: 18px; border-radius: 50%; background: var(--primary-600);
      border: 3px solid #FFFFFF; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative;
    }
    .rh-pin-marker.critical { background: #E11D48; }
    .rh-pin-marker.severe { background: #D97706; }
    
    .rh-pin-pulse {
      position: absolute; inset: -8px; border-radius: 50%;
      border: 2px solid var(--primary-500);
      animation: rh-pin-ring 1.8s cubic-bezier(0.165,0.84,0.44,1) infinite;
    }
    .rh-pin-pulse.critical { border-color: #E11D48; }
    .rh-pin-pulse.severe { border-color: #D97706; }
    
    @keyframes rh-pin-ring {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }

    /* Sticky Bottom SOS Trigger */
    .rh-floating-sos {
      position: fixed; bottom: 24px; right: 28px; z-index: 1000;
      display: flex; align-items: center; gap: 12px; background: rgba(225, 29, 72, 0.96);
      color: #FFFFFF; padding: 14px 22px; border-radius: 999px; box-shadow: 0 10px 30px rgba(225, 29, 72, 0.5);
      cursor: pointer; transition: all 0.25s ease; border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(8px);
    }
    .rh-floating-sos:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 14px 38px rgba(225, 29, 72, 0.65); }

    /* Modals */
    .rh-modal-overlay {
      position: fixed; inset: 0; background: rgba(11, 30, 28, 0.7); backdrop-filter: blur(8px);
      z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;
    }
    .rh-modal-card {
      background: #FFFFFF; border-radius: 28px; width: 100%; max-width: 540px; padding: 32px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.3); position: relative; max-height: 90vh; overflow-y: auto;
    }

    /* Footer with Creator Attribution */
    .rh-footer {
      border-top: 1.5px solid var(--line); background: #FFFFFF; padding: 48px 36px 36px;
      position: relative; z-index: 10;
    }
    .rh-footer-inner {
      max-width: 1280px; margin: 0 auto; display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 24px;
    }
    .rh-creator-badge {
      display: inline-flex; align-items: center; gap: 8px; background: var(--primary-50);
      border: 1.5px solid var(--primary-200); padding: 8px 18px; border-radius: 999px;
      font-weight: 800; font-size: 14px; color: var(--primary-900); font-family: 'JetBrains Mono', monospace;
    }
    .rh-creator-badge strong { color: var(--primary-600); }

    @media (max-width: 1024px) {
      .rh-hero { grid-template-columns: 1fr; text-align: center; }
      .rh-hero-eyebrow { margin: 0 auto 16px; }
      .rh-hero p { margin: 0 auto 24px; }
      .rh-action-hub { grid-template-columns: repeat(2, 1fr); }
      .rh-process-bar { grid-template-columns: repeat(2, 1fr); }
      .rh-step-item:not(:last-child)::after { display: none; }
      .rh-metaphor-card { grid-template-columns: 1fr; }
      .rh-gallery-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 640px) {
      .rh-action-hub { grid-template-columns: 1fr; }
      .rh-process-bar { grid-template-columns: 1fr; }
      .rh-gallery-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

function makeGlowTexture(hex: string) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();
  const c = new THREE.Color(hex);
  const r = Math.floor(c.r * 255), g = Math.floor(c.g * 255), b = Math.floor(c.b * 255);
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0, `rgba(${r},${g},${b},1)`);
  grad.addColorStop(0.35, `rgba(${r},${g},${b},0.6)`);
  grad.addColorStop(0.7, `rgba(${r},${g},${b},0.15)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// =========================================================================
// 3D BURNING-TO-EXTINGUISHING METAPHOR (RAAHAT)
// =========================================================================
const BurningToComfort3D = ({ isExtinguished, onToggle }: { isExtinguished: boolean; onToggle: () => void }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ extinguished: isExtinguished, transitionProgress: isExtinguished ? 1 : 0 });

  useEffect(() => {
    stateRef.current.extinguished = isExtinguished;
  }, [isExtinguished]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let raf: number;
    let renderer: THREE.WebGLRenderer | null = null;

    try {
      const width = mount.clientWidth || 500;
      const height = mount.clientHeight || 360;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
      camera.position.set(0, 1, 8.5);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const coreGeo = new THREE.SphereGeometry(1.2, 32, 32);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xFF5722,
        roughness: 0.3,
        metalness: 0.1,
        emissive: 0xFF3D00,
        emissiveIntensity: 1.2,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      const fireGlowTex = makeGlowTexture('#FF7043');
      const comfortGlowTex = makeGlowTexture('#14B8A6');
      const glowMat = new THREE.SpriteMaterial({
        map: fireGlowTex,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.set(4.5, 4.5, 1);
      group.add(glowSprite);

      // Fire Particles
      const fireCount = 400;
      const fireGeo = new THREE.BufferGeometry();
      const firePos = new Float32Array(fireCount * 3);
      const fireVel = new Float32Array(fireCount * 3);
      const fireLife = new Float32Array(fireCount);

      for (let i = 0; i < fireCount; i++) {
        firePos[i * 3] = (Math.random() - 0.5) * 1.5;
        firePos[i * 3 + 1] = (Math.random() - 0.5) * 1.2;
        firePos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

        fireVel[i * 3] = (Math.random() - 0.5) * 0.02;
        fireVel[i * 3 + 1] = 0.04 + Math.random() * 0.05;
        fireVel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

        fireLife[i] = Math.random();
      }
      fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));

      const fireMat = new THREE.PointsMaterial({
        size: 0.28,
        color: 0xFFA000,
        map: makeGlowTexture('#FF9100'),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const fireParticles = new THREE.Points(fireGeo, fireMat);
      group.add(fireParticles);

      // Water Particles
      const waterCount = 350;
      const waterGeo = new THREE.BufferGeometry();
      const waterPos = new Float32Array(waterCount * 3);
      const waterVel = new Float32Array(waterCount * 3);

      for (let i = 0; i < waterCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 2.2 + Math.random() * 2.2;
        waterPos[i * 3] = Math.cos(angle) * radius;
        waterPos[i * 3 + 1] = 3.5 + Math.random() * 3.0;
        waterPos[i * 3 + 2] = Math.sin(angle) * radius;

        waterVel[i * 3] = -Math.cos(angle) * 0.04;
        waterVel[i * 3 + 1] = -0.05 - Math.random() * 0.04;
        waterVel[i * 3 + 2] = -Math.sin(angle) * 0.04;
      }
      waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));

      const waterMat = new THREE.PointsMaterial({
        size: 0.25,
        color: 0x38BDF8,
        map: makeGlowTexture('#38BDF8'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const waterParticles = new THREE.Points(waterGeo, waterMat);
      group.add(waterParticles);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xFF7043, 2, 15);
      pointLight.position.set(0, 1, 2);
      scene.add(pointLight);

      const clock = new THREE.Clock();

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const dt = clock.getDelta();
        const time = clock.getElapsedTime();

        const targetT = stateRef.current.extinguished ? 1 : 0;
        stateRef.current.transitionProgress += (targetT - stateRef.current.transitionProgress) * 0.04;
        const t = stateRef.current.transitionProgress;

        group.rotation.y = time * 0.35;
        group.rotation.x = Math.sin(time * 0.25) * 0.08;

        const fPos = fireParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < fireCount; i++) {
          fireLife[i] += dt * (1.2 + Math.random() * 0.5);
          if (fireLife[i] > 1.0) {
            fireLife[i] = 0;
            fPos[i * 3] = (Math.random() - 0.5) * (1.4 * (1 - t * 0.8));
            fPos[i * 3 + 1] = -0.4;
            fPos[i * 3 + 2] = (Math.random() - 0.5) * (1.4 * (1 - t * 0.8));
          } else {
            fPos[i * 3] += fireVel[i * 3] + Math.sin(time * 8 + i) * 0.006;
            fPos[i * 3 + 1] += fireVel[i * 3 + 1] * (1.0 - t * 0.75);
            fPos[i * 3 + 2] += fireVel[i * 3 + 2] + Math.cos(time * 8 + i) * 0.006;
          }
        }
        fireParticles.geometry.attributes.position.needsUpdate = true;
        fireMat.opacity = Math.max(0, (1 - t * 1.2) * 0.9);

        const wPos = waterParticles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < waterCount; i++) {
          wPos[i * 3] += waterVel[i * 3];
          wPos[i * 3 + 1] += waterVel[i * 3 + 1];
          wPos[i * 3 + 2] += waterVel[i * 3 + 2];
          if (wPos[i * 3 + 1] < -1.5) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 2.0 + Math.random() * 2.0;
            wPos[i * 3] = Math.cos(angle) * radius;
            wPos[i * 3 + 1] = 3.0 + Math.random() * 2.0;
            wPos[i * 3 + 2] = Math.sin(angle) * radius;
          }
        }
        waterParticles.geometry.attributes.position.needsUpdate = true;
        waterMat.opacity = Math.sin(t * Math.PI) * 0.85 + (t > 0.8 ? 0.35 : 0);

        const fireColor = new THREE.Color(0xE11D48);
        const comfortColor = new THREE.Color(0x0D9488);
        coreMat.color = fireColor.clone().lerp(comfortColor, t);
        coreMat.emissive = fireColor.clone().lerp(new THREE.Color(0x14B8A6), t);
        coreMat.emissiveIntensity = THREE.MathUtils.lerp(1.5, 0.6, t);

        glowMat.map = t > 0.5 ? comfortGlowTex : fireGlowTex;
        glowMat.opacity = THREE.MathUtils.lerp(0.85, 0.7, t);
        glowSprite.scale.setScalar(THREE.MathUtils.lerp(4.5, 3.8 + Math.sin(time * 2) * 0.2, t));

        pointLight.color = new THREE.Color(0xFF7043).lerp(new THREE.Color(0x2DD4BF), t);
        pointLight.intensity = THREE.MathUtils.lerp(2.5, 1.2, t);

        renderer!.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!mount || !renderer) return;
        camera.aspect = (mount.clientWidth || 500) / (mount.clientHeight || 360);
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth || 500, mount.clientHeight || 360);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      };
    } catch (e) {
      console.warn('BurningToComfort3D error:', e);
    }
  }, []);

  return (
    <div className="rh-metaphor-card rh-shadow">
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: isExtinguished ? 'var(--primary-100)' : '#FFE4E6', borderRadius: '999px', color: isExtinguished ? 'var(--primary-900)' : '#BE123C', fontSize: '13px', fontWeight: 800, marginBottom: '16px', fontFamily: 'JetBrains Mono, monospace' }}>
          {isExtinguished ? <IconDroplets size={16} /> : <IconFlame size={16} />}
          {isExtinguished ? 'Solace Restored (Raahat Deployed)' : 'Emergency Flame (Crisis Detected)'}
        </div>
        
        <h3 className="rh-font-serif" style={{ fontSize: '34px', color: 'var(--primary-900)', margin: '0 0 14px', lineHeight: 1.15 }}>
          {isExtinguished ? (
            <span>The Crisis is <span className="rh-hi-teal">Quenched</span>. Solace Restored.</span>
          ) : (
            <span>The Fire of Disaster <span className="rh-hi-amber">Burns</span>.</span>
          )}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '14px', border: '1.5px solid var(--line)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>Flame Level</span>
            <strong style={{ display: 'block', fontSize: '18px', color: isExtinguished ? '#059669' : '#E11D48' }}>
              {isExtinguished ? 'Extinguished' : 'Active 890°C'}
            </strong>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '14px', border: '1.5px solid var(--line)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>Cooling Mist</span>
            <strong style={{ display: 'block', fontSize: '18px', color: '#0284C7' }}>
              {isExtinguished ? 'Active 100%' : 'Standby'}
            </strong>
          </div>
          <div style={{ background: '#FFFFFF', padding: '12px', borderRadius: '14px', border: '1.5px solid var(--line)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate)', textTransform: 'uppercase', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>Citizens Safe</span>
            <strong style={{ display: 'block', fontSize: '18px', color: 'var(--primary-700)' }}>4,820 Rescued</strong>
          </div>
        </div>
        
        <button
          onClick={onToggle}
          className="rh-btn-toggle-quench"
          style={{ background: isExtinguished ? 'linear-gradient(135deg, #0D9488, #0284C7)' : 'linear-gradient(135deg, #E11D48, #D97706)' }}
        >
          {isExtinguished ? (
            <><IconFlame size={18} /> Test Emergency Flame</>
          ) : (
            <><IconDroplets size={18} /> Tap to Extinguish Crisis (Raahat)</>
          )}
        </button>
      </div>

      <div className="rh-canvas-container">
        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
        <div className="rh-extinguish-controls">
          <button onClick={onToggle} style={{ background: 'rgba(255,255,255,0.92)', border: 'none', padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 800, color: 'var(--primary-900)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
            {isExtinguished ? '💧 Quenched State' : '🔥 Burning State'}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// CITIES METADATA & LEAFLET MAP
// =========================================================================
interface CityIssue {
  id: string;
  name: string;
  lat: number;
  lng: number;
  issueShort: string;
  category: 'flood' | 'smog' | 'cyclone' | 'water';
  severity: 'critical' | 'severe' | 'stable';
  icon: string;
  teamsDeployed: string;
}

const CITIES: CityIssue[] = [
  { id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lng: 77.2090, issueShort: 'Smog & Air Crisis', category: 'smog', severity: 'severe', icon: '💨', teamsDeployed: '24 Mobile Oxygen Wings' },
  { id: 'mumbai', name: 'Mumbai Coast', lat: 19.0760, lng: 72.8777, issueShort: 'Flash Flood Rescue', category: 'flood', severity: 'critical', icon: '🌊', teamsDeployed: '42 Zodiac Boats' },
  { id: 'guwahati', name: 'Guwahati Sector', lat: 26.1445, lng: 91.7362, issueShort: 'Brahmaputra Flood', category: 'flood', severity: 'critical', icon: '🚨', teamsDeployed: '12 Airlift Helis' },
  { id: 'chennai', name: 'Chennai Hub', lat: 13.0827, lng: 80.2707, issueShort: 'Cyclone Michaung', category: 'cyclone', severity: 'severe', icon: '🌀', teamsDeployed: '34 Storm Refuges' },
  { id: 'kolkata', name: 'Kolkata Node', lat: 22.5726, lng: 88.3639, issueShort: 'Water Purification', category: 'water', severity: 'stable', icon: '💧', teamsDeployed: '12 RO Filtration Bowsers' },
];

const TacticalMap = ({ selectedFilter, onSelectCity, activeCityId }: { selectedFilter: string; onSelectCity: (city: CityIssue) => void; activeCityId: string | null }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    let isMounted = true;

    const setupLeaflet = () => {
      if (!mapRef.current || mapInstance.current || !isMounted) return;
      const L = (window as any).L;
      if (!L) return;

      if ((mapRef.current as any)._leaflet_id) {
        delete (mapRef.current as any)._leaflet_id;
      }

      try {
        const map = L.map(mapRef.current, { zoomControl: false }).setView([22.5, 78.9], 5);
        mapInstance.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }).addTo(map);

        CITIES.forEach(city => {
          const customIcon = L.divIcon({
            className: 'rh-custom-leaflet-marker',
            html: `
              <div class="rh-map-pin" id="marker-${city.id}">
                <div class="rh-pin-badge ${city.severity}">
                  <span>${city.icon}</span>
                  <span>${city.issueShort}</span>
                </div>
                <div class="rh-pin-marker ${city.severity}">
                  <div class="rh-pin-pulse ${city.severity}"></div>
                </div>
              </div>
            `,
            iconSize: [120, 48],
            iconAnchor: [60, 48],
            popupAnchor: [0, -50],
          });

          const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);
          marker.on('click', () => onSelectCity(city));

          const popupContent = `
            <div style="font-family: Plus Jakarta Sans, sans-serif; padding: 4px; min-width: 220px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <strong style="color: #134E4A; font-size: 15px;">${city.name}</strong>
                <span style="font-size: 11px; font-weight: 800; font-family: JetBrains Mono; text-transform: uppercase; padding: 2px 8px; border-radius: 999px; background: ${city.severity === 'critical' ? '#FFE4E6; color: #E11D48' : city.severity === 'severe' ? '#FEF3C7; color: #D97706' : '#ECFDF5; color: #059669'};">
                  ${city.severity}
                </span>
              </div>
              <div style="color: #0D9488; font-size: 13px; font-weight: 700; margin-bottom: 8px;">
                ${city.icon} ${city.issueShort}
              </div>
              <div style="border-top: 1px solid #E6F3F1; padding-top: 6px; font-size: 11px; color: #0F766E; font-weight: 700;">
                Deployment: ${city.teamsDeployed}
              </div>
            </div>
          `;
          marker.bindPopup(popupContent);
          markersRef.current[city.id] = marker;
        });
      } catch (err) {
        console.warn('Leaflet error:', err);
      }
    };

    if ((window as any).L) {
      setupLeaflet();
    } else {
      const timer = setInterval(() => {
        if ((window as any).L) {
          clearInterval(timer);
          setupLeaflet();
        }
      }, 100);
      return () => { clearInterval(timer); isMounted = false; };
    }

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        try { mapInstance.current.remove(); } catch (e) {}
        mapInstance.current = null;
      }
    };
  }, [onSelectCity]);

  useEffect(() => {
    if (!mapInstance.current) return;
    if (activeCityId && markersRef.current[activeCityId]) {
      const city = CITIES.find(c => c.id === activeCityId);
      if (city) {
        mapInstance.current.flyTo([city.lat, city.lng], 7, { duration: 1.2 });
        markersRef.current[activeCityId].openPopup();
      }
    } else if (selectedFilter === 'all') {
      mapInstance.current.flyTo([22.5, 78.9], 5, { duration: 1.2 });
    }
  }, [activeCityId, selectedFilter]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '26px' }} />;
};

// =========================================================================
// MAIN RAAHAT APPLICATION
// =========================================================================
export default function RaahatApp() {
  const [isExtinguished, setIsExtinguished] = useState(true);
  const [selectedMapFilter, setSelectedMapFilter] = useState('all');
  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState('all');
  const [activeCity, setActiveCity] = useState<CityIssue | null>(null);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<DisasterPhoto | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSubmitted, setSosSubmitted] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleCopyHotline = () => {
    navigator.clipboard.writeText('1070');
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleMapFilterClick = (filterKey: string, cityId?: string) => {
    setSelectedMapFilter(filterKey);
    if (cityId) {
      const target = CITIES.find(c => c.id === cityId);
      if (target) setActiveCity(target);
    } else {
      setActiveCity(null);
    }
  };

  const filteredPhotos = selectedPhotoCategory === 'all'
    ? DISASTER_PHOTOS
    : DISASTER_PHOTOS.filter(p => p.category === selectedPhotoCategory);

  return (
    <div className="rh-app">
      <GlobalStyles />

      {/* Top 24/7 Ticker */}
      <div className="rh-top-ticker">
        <span className="tag">Live Humanitarian Grid</span>
        <span className="rh-pulse-dot" />
        <span>14 Disaster Sectors Operational • Wildfire Aerial Tankers &amp; Flood Inflatables Mobilized</span>
        <button
          onClick={() => setShowSosModal(true)}
          style={{ background: '#FFFFFF', color: '#0F766E', border: 'none', padding: '4px 14px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
        >
          SOS Request ⚡
        </button>
      </div>

      {/* Header */}
      <header className="rh-header">
        <a href="#" className="rh-brand">
          <div className="rh-brand-mark"><IconHeartHandshake size={24} /></div>
          <div>
            <h1>Raahat</h1>
            <span>Comfort &amp; Rescue Grid</span>
          </div>
        </a>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button className="rh-btn-outline" onClick={handleCopyHotline} style={{ padding: '10px 18px', fontSize: '13px' }}>
            <IconPhoneCall size={16} />
            <span>{copyFeedback ? 'Copied 1070!' : 'Emergency: 1070'}</span>
          </button>
          <button className="rh-btn-sos" onClick={() => setShowSosModal(true)}>
            <IconAlertCircle size={16} /> Request Immediate Rescue
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="rh-hero-wrap">
        <section className="rh-hero">
          <div>
            <div className="rh-hero-eyebrow">
              <span className="rh-pulse-dot" />
              <span>National Disaster Command • 24/7 Active</span>
            </div>
            
            <h2 className="rh-font-display">
              When Crisis Burns,<br />
              <span className="rh-hi-teal">Raahat</span> Restores Solace.
            </h2>
            
            <p>
              Direct emergency intervention for <span className="rh-hi-amber">Wildfires</span>, <span className="rh-hi-violet">Cyclones</span>, <span className="rh-hi-teal">Flash Floods</span>, and <span className="rh-hi-green">Earthquakes</span>
            </p>

            {/* Direct-Action Hub */}
            {/*
            <div className="rh-action-hub">
              <div className="rh-action-chip" onClick={() => setShowSosModal(true)}>
                <span style={{ fontSize: '20px' }}>🚨</span>
                <strong>Instant SOS</strong>
                <span>Dispatch in &lt; 12 mins</span>
                <span className="rh-font-mono">ETA &lt; 12 MINS</span>
              </div>
              <div className="rh-action-chip" onClick={() => handleMapFilterClick('flood', 'mumbai')}>
                <span style={{ fontSize: '20px' }}>🌊</span>
                <strong>Flood Rescue</strong>
                <span>42 Zodiacs in Mumbai</span>
                <span className="rh-font-mono">42 ZODIACS ACTIVE</span>
              </div>
              <div className="rh-action-chip" onClick={() => handleMapFilterClick('smog', 'delhi')}>
                <span style={{ fontSize: '20px' }}>💨</span>
                <strong>Smog &amp; O₂ Aid</strong>
                <span>800 Purifiers in Delhi</span>
                <span className="rh-font-mono">800 PURIFIERS ON</span>
              </div>
              <div className="rh-action-chip" onClick={() => handleMapFilterClick('cyclone', 'chennai')}>
                <span style={{ fontSize: '20px' }}>🌀</span>
                <strong>Cyclone Havens</strong>
                <span>34 Refuges in Chennai</span>
                <span className="rh-font-mono">34 REFUGES OPEN</span>
              </div>
            </div>
*/}

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <button className="rh-btn-teal" onClick={() => {
                const el = document.getElementById('field-photos');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                <IconCamera size={18} /> View Live Field Relief Photos
              </button>
              <button className="rh-btn-outline" onClick={() => {
                const el = document.getElementById('interactive-map');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}>
                <IconMapIcon size={18} /> Inspect Live Crisis Map
              </button>
            </div>
          </div>

          {/* Hero Visual Card */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', borderRadius: '28px', overflow: 'hidden', background: '#FFFFFF', border: '1.5px solid var(--line)', boxShadow: '0 20px 48px -14px rgba(13, 148, 136, 0.2)' }}>
              <img
                src="https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=900&q=80"
                alt="Amphibious flood rescue crew"
                style={{ width: '100%', height: '280px', objectFit: 'cover' }}
              />
              <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
                <div>
                  <strong style={{ color: 'var(--primary-900)', fontSize: '15px', display: 'block', fontWeight: 800 }}>NDRF &amp; Raahat Rapid Response</strong>
                  <span style={{ color: 'var(--slate)', fontSize: '12px' }}>Assam &amp; Western Sector Deluge Deployment</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '12px', fontWeight: 800, fontFamily: 'JetBrains Mono' }}>
                  <IconShield size={16} /> 24/7 ON SITE
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Step Process Bar */}
        <section className="rh-process-section" style={{ padding: '0 36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0 0 12px 4px' }}>
            <span className="rh-pulse-dot" />
            <span className="rh-font-mono" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Response sequence</span>
          </div>
        <div className="rh-process-bar rh-shadow-sm">
          <div className="rh-step-item">
            <div className="rh-step-visual signal"><IconAlertCircle size={27} /><div className="rh-step-num">01</div></div>
            <div className="rh-step-label">SOS Signal</div>
            <div className="rh-step-detail">&lt; 30s satellite ping</div>
          </div>
          <div className="rh-step-item">
            <div className="rh-step-visual triage"><IconSparkles size={27} /><div className="rh-step-num">02</div></div>
            <div className="rh-step-label">AI Triage</div>
            <div className="rh-step-detail">Severity &amp; medical routing</div>
          </div>
          <div className="rh-step-item">
            <div className="rh-step-visual deploy"><IconPhoneCall size={27} /><div className="rh-step-num">03</div></div>
            <div className="rh-step-label">Teams Mobilized</div>
            <div className="rh-step-detail">Average response &lt; 12 mins</div>
          </div>
          <div className="rh-step-item">
            <div className="rh-step-visual safe"><IconHeartHandshake size={27} /><div className="rh-step-num">04</div></div>
            <div className="rh-step-label">Safe Haven</div>
            <div className="rh-step-detail">Water, blankets &amp; shelter</div>
          </div>
        </div>
        </section>
      </div>

      {/* 3D Burning-to-Extinguish (Raahat Metaphor) */}
      <section className="rh-metaphor-section">
        <BurningToComfort3D
          isExtinguished={isExtinguished}
          onToggle={() => setIsExtinguished(!isExtinguished)}
        />
      </section>

      {/* =========================================================================
          NEW SECTION: FIELD RELIEF PHOTOS (Wildfires, Earthquakes, Typhoons, Floods)
          ========================================================================= */}
      <section id="field-photos" className="rh-gallery-section">
        <div className="rh-gallery-header">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono' }}>
              <IconCamera size={15} /> Ground Telemetry &amp; Field Operations
            </div>
            <h3 className="rh-font-serif" style={{ fontSize: '36px', color: 'var(--primary-900)', margin: '6px 0 0' }}>
              Disaster Relief in Action
            </h3>
            <p style={{ color: 'var(--slate)', fontSize: '15px', margin: '4px 0 0' }}>
              Real-time documented relief operations across fire lines, flooded rivers, and seismic zones.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="rh-filter-chips">
            <button className={`rh-filter-btn ${selectedPhotoCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedPhotoCategory('all')}>
              🌐 All Operations (6)
            </button>
            <button className={`rh-filter-btn ${selectedPhotoCategory === 'wildfire' ? 'active' : ''}`} onClick={() => setSelectedPhotoCategory('wildfire')}>
              🔥 Forest Fires
            </button>
            <button className={`rh-filter-btn ${selectedPhotoCategory === 'earthquake' ? 'active' : ''}`} onClick={() => setSelectedPhotoCategory('earthquake')}>
              🏚️ Earthquakes
            </button>
            <button className={`rh-filter-btn ${selectedPhotoCategory === 'typhoon' ? 'active' : ''}`} onClick={() => setSelectedPhotoCategory('typhoon')}>
              🌀 Typhoons
            </button>
            <button className={`rh-filter-btn ${selectedPhotoCategory === 'flood' ? 'active' : ''}`} onClick={() => setSelectedPhotoCategory('flood')}>
              🌊 Floods
            </button>
            <button className={`rh-filter-btn ${selectedPhotoCategory === 'medical' ? 'active' : ''}`} onClick={() => setSelectedPhotoCategory('medical')}>
              🩺 Medical Camps
            </button>
          </div>
        </div>

        {/* Photos Grid */}
        <div className="rh-gallery-grid">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="rh-photo-card rh-shadow-sm"
              onClick={() => setSelectedPhotoModal(photo)}
            >
              <div className="rh-photo-img-wrap">
                <img src={photo.imgUrl} alt={photo.title} className="rh-photo-img" />
                <span className={`rh-photo-status-badge rh-badge-${photo.tagColor}`}>
                  {photo.status}
                </span>
              </div>
              <div className="rh-photo-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'JetBrains Mono' }}>
                    {photo.tag}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--slate)' }}>
                    📍 {photo.location.split('&')[0]}
                  </span>
                </div>
                <h4>{photo.title}</h4>
                <p>{photo.description}</p>
                <div className="rh-photo-stat">
                  ⚡ {photo.stat}
                </div>
                <button
                  className="rh-btn-outline"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13px', fontWeight: 800 }}
                >
                  {photo.actionPrompt} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Tactical Map with Filters */}
      <section id="interactive-map" className="rh-map-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, color: 'var(--primary-700)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono' }}>
              <IconMapIcon size={14} /> Real-Time Geographic Crisis Radar
            </div>
            <h3 className="rh-font-serif" style={{ fontSize: '34px', color: 'var(--primary-900)', margin: '4px 0 0' }}>
              Active Pinpoints &amp; Field Hubs
            </h3>
          </div>

          <div className="rh-filter-chips">
            <button className={`rh-filter-btn ${selectedMapFilter === 'all' ? 'active' : ''}`} onClick={() => handleMapFilterClick('all')}>
              🌐 All Regions (5)
            </button>
            <button className={`rh-filter-btn ${selectedMapFilter === 'flood' ? 'active' : ''}`} onClick={() => handleMapFilterClick('flood', 'mumbai')}>
              🌊 Floods (Mumbai)
            </button>
            <button className={`rh-filter-btn ${selectedMapFilter === 'smog' ? 'active' : ''}`} onClick={() => handleMapFilterClick('smog', 'delhi')}>
              💨 Smog (Delhi)
            </button>
            <button className={`rh-filter-btn ${selectedMapFilter === 'cyclone' ? 'active' : ''}`} onClick={() => handleMapFilterClick('cyclone', 'chennai')}>
              🌀 Cyclone (Chennai)
            </button>
            <button className={`rh-filter-btn ${selectedMapFilter === 'water' ? 'active' : ''}`} onClick={() => handleMapFilterClick('water', 'kolkata')}>
              💧 Clean Water (Kolkata)
            </button>
          </div>
        </div>

        <div className="rh-map-frame rh-shadow">
          <TacticalMap
            selectedFilter={selectedMapFilter}
            onSelectCity={(city) => setActiveCity(city)}
            activeCityId={activeCity ? activeCity.id : null}
          />
        </div>
      </section>

      {/* Persistent Floating Quick SOS Dispatch Action */}
      <div className="rh-floating-sos" onClick={() => setShowSosModal(true)}>
        <span className="rh-pulse-dot" style={{ background: '#FFFFFF' }} />
        <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.02em', fontFamily: 'Plus Jakarta Sans' }}>
          🚨 NEED URGENT RESCUE? TAP SOS
        </span>
      </div>

      {/* Incident Detail Modal (from photo click) */}
      {selectedPhotoModal && (
        <div className="rh-modal-overlay" onClick={() => setSelectedPhotoModal(null)}>
          <div className="rh-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className={`rh-photo-status-badge rh-badge-${selectedPhotoModal.tagColor}`} style={{ position: 'static' }}>
                {selectedPhotoModal.status}
              </span>
              <button onClick={() => setSelectedPhotoModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <IconX size={20} />
              </button>
            </div>

            <img
              src={selectedPhotoModal.imgUrl}
              alt={selectedPhotoModal.title}
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px' }}
            />

            <h3 className="rh-font-serif" style={{ fontSize: '24px', margin: '0 0 8px', color: 'var(--primary-900)' }}>
              {selectedPhotoModal.title}
            </h3>
            <div style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: '14px' }}>
              📍 <strong>Location:</strong> {selectedPhotoModal.location}
            </div>

            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--slate)', margin: '0 0 16px' }}>
              {selectedPhotoModal.description}
            </p>

            <div style={{ padding: '12px 16px', background: 'var(--primary-50)', borderRadius: '14px', border: '1.5px solid var(--primary-200)', marginBottom: '20px' }}>
              <strong style={{ color: 'var(--primary-900)', fontSize: '13px', display: 'block', marginBottom: '4px', fontFamily: 'JetBrains Mono' }}>
                Operational Metrics:
              </strong>
              <div style={{ fontSize: '13px', color: 'var(--primary-700)', fontWeight: 700 }}>
                {selectedPhotoModal.stat}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="rh-btn-sos"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setSelectedPhotoModal(null); setShowSosModal(true); }}
              >
                🚨 Request Dispatch Here
              </button>
              <button
                className="rh-btn-outline"
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setSelectedPhotoModal(null)}
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      {showSosModal && (
        <div className="rh-modal-overlay" onClick={() => setShowSosModal(false)}>
          <div className="rh-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFE4E6', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconAlertCircle size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--primary-900)' }}>Emergency Dispatch Signal</h4>
                  <span style={{ fontSize: '12px', color: 'var(--slate)' }}>Connected to nearest Raahat command unit</span>
                </div>
              </div>
              <button onClick={() => setShowSosModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}>
                <IconX size={20} />
              </button>
            </div>

            {sosSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <IconCheck size={36} />
                </div>
                <h4 style={{ margin: '0 0 8px', fontSize: '22px', color: 'var(--primary-900)' }}>Dispatch Confirmed!</h4>
                <p style={{ color: 'var(--slate)', fontSize: '14px', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Incident ticket <strong>#RH-9428</strong> generated. Nearest amphibious &amp; medical rapid unit en route. Estimated arrival: <strong>11 minutes</strong>.
                </p>
                <button className="rh-btn-teal" onClick={() => { setSosSubmitted(false); setShowSosModal(false); }} style={{ width: '100%', justifyContent: 'center' }}>
                  Return to Live Grid
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSosSubmitted(true); }}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-900)' }}>
                    Type of Disaster
                  </label>
                  <select style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid var(--line)', background: '#F8FAFC', fontSize: '14px', fontFamily: 'inherit', fontWeight: 600 }}>
                    <option>🔥 Forest Fire / Encroaching Smoke</option>
                    <option>🌊 Severe Waterlogging / Flood Trapped</option>
                    <option>🏚️ Structural Rubble / Earthquake Extraction</option>
                    <option>🌀 Cyclone Inundation / Roof Collapse</option>
                    <option>🩺 Critical Medical Trauma / Oxygen Needed</option>
                  </select>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-900)' }}>
                    Location / Landmark
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sector 14, Near Ridge Road or GPS"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid var(--line)', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--primary-900)' }}>
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1.5px solid var(--line)', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>

                <button type="submit" className="rh-btn-sos" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                  🚨 Confirm &amp; Dispatch Immediate Rescue
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer with Creator Attribution */}
      <footer className="rh-footer">
        <div className="rh-footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <IconHeartHandshake size={16} />
              </div>
              <strong className="rh-font-display" style={{ color: 'var(--primary-900)', fontSize: '20px' }}>Raahat Emergency Grid</strong>
            </div>
            <small style={{ color: 'var(--slate)' }}>Rapid decentralized disaster mitigation and humanitarian relief.</small>
          </div>

          {/* Prominent Creator Credit: Created by Aditi Gupta */}
          <div className="rh-creator-badge">
            <IconSparkles size={16} />
            <span>Created by <strong>Aditi Gupta</strong></span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="rh-btn-outline" onClick={handleCopyHotline} style={{ padding: '8px 16px', fontSize: '13px' }}>
              <IconPhoneCall size={14} /> National Helpline: 1070
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}