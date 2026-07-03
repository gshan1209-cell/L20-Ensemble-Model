export const CATEGORICAL_OPTIONS: Record<string, string[]> = {
  workclass: [
    "Private",
    "Self-emp-not-inc",
    "Self-emp-inc",
    "Federal-gov",
    "Local-gov",
    "State-gov",
    "Without-pay",
    "Never-worked",
  ],
  education: [
    "Bachelors",
    "Some-college",
    "11th",
    "HS-grad",
    "Prof-school",
    "Assoc-acdm",
    "Assoc-voc",
    "9th",
    "7th-8th",
    "12th",
    "Masters",
    "1st-4th",
    "10th",
    "Doctorate",
    "5th-6th",
    "Preschool",
  ],
  marital_status: [
    "Married-civ-spouse",
    "Divorced",
    "Never-married",
    "Separated",
    "Widowed",
    "Married-spouse-absent",
    "Married-AF-spouse",
  ],
  occupation: [
    "Tech-support",
    "Craft-repair",
    "Other-service",
    "Sales",
    "Exec-managerial",
    "Prof-specialty",
    "Handlers-cleaners",
    "Machine-op-inspct",
    "Adm-clerical",
    "Farming-fishing",
    "Transport-moving",
    "Priv-house-serv",
    "Protective-serv",
    "Armed-Forces",
  ],
  relationship: [
    "Wife",
    "Own-child",
    "Husband",
    "Not-in-family",
    "Other-relative",
    "Unmarried",
  ],
  race: [
    "White",
    "Asian-Pac-Islander",
    "Amer-Indian-Eskimo",
    "Other",
    "Black",
  ],
  sex: ["Male", "Female"],
  native_country: [
    "United-States",
    "Cambodia",
    "England",
    "Puerto-Rico",
    "Canada",
    "Germany",
    "Outlying-US(Guam-USVI-etc)",
    "India",
    "Japan",
    "Greece",
    "South",
    "China",
    "Cuba",
    "Iran",
    "Honduras",
    "Philippines",
    "Italy",
    "Poland",
    "Jamaica",
    "Vietnam",
    "Mexico",
    "Portugal",
    "Ireland",
    "France",
    "Dominican-Republic",
    "Laos",
    "Ecuador",
    "Taiwan",
    "Haiti",
    "Columbia",
    "Hungary",
    "Guatemala",
    "Nicaragua",
    "Scotland",
    "Thailand",
    "Yugoslavia",
    "El-Salvador",
    "Trinadad&Tobago",
    "Peru",
    "Hong",
    "Holand-Netherlands",
  ],
};

export const LABELS: Record<string, string> = {
  age: "Age",
  workclass: "Workclass",
  education: "Education",
  marital_status: "Marital Status",
  occupation: "Occupation",
  relationship: "Relationship",
  race: "Race",
  sex: "Sex",
  capital_gain: "Capital Gain",
  capital_loss: "Capital Loss",
  hours_per_week: "Hours per Week",
  native_country: "Native Country",
};

export const NUMERIC_FIELDS = [
  "age",
  "capital_gain",
  "capital_loss",
  "hours_per_week",
] as const;

export const CATEGORICAL_FIELDS = [
  "workclass",
  "education",
  "marital_status",
  "occupation",
  "relationship",
  "race",
  "sex",
  "native_country",
] as const;

export const PARTIAL_FIELDS = [
  ...NUMERIC_FIELDS,
  ...CATEGORICAL_FIELDS,
] as const;

export type NumericField = (typeof NUMERIC_FIELDS)[number];
export type CategoricalField = (typeof CATEGORICAL_FIELDS)[number];
export type PartialField = NumericField | CategoricalField;

export interface PredictionInput {
  age: number;
  workclass: string;
  education: string;
  marital_status: string;
  occupation: string;
  relationship: string;
  race: string;
  sex: string;
  capital_gain: number;
  capital_loss: number;
  hours_per_week: number;
  native_country: string;
}

export interface PredictionResult {
  prediction: string;
  probability: number;
  class_probabilities: Record<string, number>;
  model_version: string;
  created_at: string;
}

export interface ModelMeta {
  model_version: string;
  algorithm: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  trained_at: string;
  dataset: string;
}

export interface PredictionLogEntry {
  id: string;
  prediction: string;
  probability: number;
  model_version: string;
  created_at: string;
}

export interface PredictionLogsResponse {
  items: PredictionLogEntry[];
  total: number;
}
