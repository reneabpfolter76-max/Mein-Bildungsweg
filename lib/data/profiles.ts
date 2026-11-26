import type { AdvisoryProfile } from "@/lib/types";

/**
 * Simulierte myWIFI-Profile. AUSSCHLIESSLICH FIKTIVE DATEN für den internen Pilot.
 * Im Produktivbetrieb kommen diese Angaben aus dem myWIFI-Account bzw. dem CRM.
 */
export interface SimulatedMyWifiProfile {
  id: string;
  /** Fiktive Kunden-ID, wie sie später aus myWIFI/CRM käme. */
  customerId: string;
  displayName: string;
  description: string;
  profile: AdvisoryProfile;
}

export const SIMULATED_PROFILES: SimulatedMyWifiProfile[] = [
  {
    id: "p1",
    customerId: "MW-TEST-0001",
    displayName: "Testprofil A – Lehrabschluss Metall",
    description: "24 Jahre, Lehre Metalltechnik, möchte sich weiterentwickeln",
    profile: {
      ageGroup: "bis 25",
      education: "Lehrabschluss Metalltechnik",
      workExperience: "5 Jahre",
      employment: "angestellt, Vollzeit",
      district: "Linz-Land",
      goal: "Weiterbildung Richtung Werkmeister",
    },
  },
  {
    id: "p2",
    customerId: "MW-TEST-0002",
    displayName: "Testprofil B – Wiedereinstieg",
    description: "38 Jahre, kaufmännische Ausbildung, Wiedereinstieg nach Karenz",
    profile: {
      ageGroup: "36–45",
      education: "Handelsschule",
      workExperience: "8 Jahre Büro, 4 Jahre Pause",
      employment: "derzeit nicht beschäftigt",
      district: "Wels",
      goal: "Wiedereinstieg im Büro, Teilzeit",
    },
  },
  {
    id: "p3",
    customerId: "MW-TEST-0003",
    displayName: "Testprofil C – Neuorientierung",
    description: "31 Jahre, Matura, unzufrieden im Job, offen für Neues",
    profile: {
      ageGroup: "26–35",
      education: "AHS-Matura, abgebrochenes Studium",
      workExperience: "7 Jahre Gastronomie",
      employment: "angestellt, Schichtdienst",
      district: "Linz",
      goal: "berufliche Neuorientierung",
    },
  },
  {
    id: "p4",
    customerId: "MW-TEST-0004",
    displayName: "Testprofil D – Ohne Lehrabschluss",
    description: "44 Jahre, langjährige Praxis ohne formalen Abschluss",
    profile: {
      ageGroup: "36–45",
      education: "Pflichtschule",
      workExperience: "20 Jahre Elektroinstallation (Hilfskraft)",
      employment: "angestellt",
      district: "Steyr",
      goal: "Lehrabschluss nachholen (außerordentliche LAP)",
    },
  },
  {
    id: "p5",
    customerId: "MW-TEST-0005",
    displayName: "Testprofil E – Führungskraft",
    description: "50 Jahre, Teamleitung, möchte Führungskompetenz ausbauen",
    profile: {
      ageGroup: "über 46",
      education: "HTL",
      workExperience: "25 Jahre, davon 6 als Teamleitung",
      employment: "angestellt, Führungsposition",
      district: "Linz",
      goal: "Führungskräfteentwicklung",
    },
  },
  {
    id: "p6",
    customerId: "MW-TEST-0006",
    displayName: "Testprofil F – Leeres Profil",
    description: "Neu registriert, keine Angaben hinterlegt",
    profile: {},
  },
];

export function getProfile(id: string): SimulatedMyWifiProfile | undefined {
  return SIMULATED_PROFILES.find((p) => p.id === id);
}
