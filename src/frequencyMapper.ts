interface FrequencyMapperParams {
  minFrequency: number;
  maxFrequency: number;
  minValue: number;
  maxValue: number;
  mapping?: (t: number) => number;
}

export function frequencyMapper({
  minFrequency,
  maxFrequency,
  minValue,
  maxValue,
  mapping,
}: FrequencyMapperParams) {
  if (!mapping) {
    mapping = (t: number) => t;
  }
  const deltaFrequency = maxFrequency - minFrequency;
  const deltaValue = maxValue - minValue;
  return (value: number) => {
    const normalized = (value - minValue) / deltaValue;
    const mapped = mapping(normalized);
    return minFrequency + mapped * deltaFrequency;
  };
}
