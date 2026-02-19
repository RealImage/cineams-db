export interface PartnerRequest {
  id: string;
  company: string;
  location: string;
  requestedBy: string;
  requestCreatedOn: string;
  name: string;
  companyLegalName: string;
  companyRole: string;
  streetAddress: string;
  city: string;
  state: string;
  country: string;
  companyWebsite: string;
  companyPhone: string;
}

export interface OperationsRegion {
  id: string;
  parameterType: "Location" | "Chain" | "Theatre";
  value: string;
}

export const partnersData: PartnerRequest[] = [
  {
    id: "1",
    company: "CineTech Solutions",
    location: "Los Angeles, CA, USA",
    requestedBy: "John Smith",
    requestCreatedOn: "2025-01-15T10:30:00Z",
    name: "CineTech Solutions Inc.",
    companyLegalName: "CineTech Solutions International LLC",
    companyRole: "Technology Provider",
    streetAddress: "1234 Sunset Boulevard",
    city: "Los Angeles",
    state: "California",
    country: "United States",
    companyWebsite: "https://www.cinetechsolutions.com",
    companyPhone: "+1 (310) 555-0142",
  },
];

export const locationOptions = [
  "Los Angeles, CA, USA",
  "New York, NY, USA",
  "London, UK",
  "Tokyo, Japan",
  "Sydney, Australia",
  "Mumbai, India",
  "Berlin, Germany",
  "Toronto, Canada",
];

export const chainOptions = [
  "AMC Theatres",
  "Regal Cinemas",
  "Cinemark",
  "Cineplex",
  "Vue Cinemas",
  "Odeon Cinemas",
  "Pathé",
  "CGR Cinemas",
];

export const theatreOptions = [
  "AMC Empire 25",
  "Regal LA Live",
  "Cinemark Century City",
  "Cineplex Scotiabank",
  "Vue Leicester Square",
  "Odeon Luxe Leicester Square",
  "Pathé Beaugrenelle",
  "CGR Bordeaux",
];
