// ClinicalTrials.gov API v2 Types

export interface Study {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle: string;
      officialTitle?: string;
    };
    statusModule: {
      overallStatus: string;
      lastKnownStatus?: string;
      startDateStruct?: {
        date: string;
      };
      completionDateStruct?: {
        date: string;
      };
    };
    designModule?: {
      phases?: string[];
      studyType?: string;
    };
    armsInterventionsModule?: {
      arms?: Arm[];
      interventions?: Intervention[];
    };
    conditionsModule?: {
      conditions?: Condition[];
    };
    contactsLocationsModule?: {
      locations?: Location[];
    };
    eligibilityModule?: {
      eligibilityCriteria: string;
      healthyVolunteers?: boolean;
      sex?: string;
      gender?: string;
      minimumAge?: string;
      maximumAge?: string;
      stdAges?: string[];
    };
    sponsorCollaboratorsModule?: {
      leadSponsor: Sponsor;
      collaborators?: Sponsor[];
    };
  };
}

export interface Arm {
  type: string;
  label: string;
  description?: string;
}

export interface Intervention {
    interventionType: string;
    name: string;
    description?: string;
}

export interface Condition {
    name: string;
}

export interface Location {
    facility?: string;
    city?: string;
    state?: string;
    country?: string;
    zip?: string;
    status?: string;
    geoPoint?: {
        lat: number;
        lon: number;
    };
}

export interface Sponsor {
    name: string;
    class?: string;
}

export interface StudySearchResponse {
  studies: Study[];
  nextPageToken?: string;
  totalCount?: number;
}

export interface StudyFieldsMetadata {
  fields: FieldMetadata[];
}

export interface FieldMetadata {
  name: string;
  type: string;
  description: string;
  enumValues?: string[];
}

export interface SearchAreas {
  areas: SearchArea[];
}

export interface SearchArea {
  name: string;
  displayName: string;
  type: string;
  enumValues?: string[];
}

export interface DatasetStats {
  totalStudies: number;
}

export interface APIVersion {
  version: string;
  apiVersion: string;
}
