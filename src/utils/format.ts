export const formatValidations = (errors: any) => {
  if (!errors || !errors.issues) return 'Validation failed'

  if (Array.isArray(errors.issues))
    return errors.issues.map((issue: any) => issue.message).join(', ')

  return JSON.stringify(errors)
}
