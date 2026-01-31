type FinalAgeLabelInput = {
  currentAge?: number
  termYears: number
}

const isWholeNumber = (value: number) => Number.isInteger(value)

/**
 * Validate that an age is a whole number between 0 and 120.
 */
export const isValidAge = (age: number) =>
  isWholeNumber(age) && age >= 0 && age <= 120

/**
 * Build the summary label, defaulting when age is missing or invalid.
 */
export const getFinalAgeLabel = ({
  currentAge,
  termYears,
}: FinalAgeLabelInput) => {
  if (currentAge === undefined || !isValidAge(currentAge)) {
    return 'Final value'
  }

  const finalAge = Math.round(currentAge + termYears)
  return `Final value at ${finalAge} years old`
}
