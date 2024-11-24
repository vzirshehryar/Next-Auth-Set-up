export const isSignUpFormValid = (fields: string[]) => {
  for (let i = 0; i < fields.length; i++) {
    if (!fields[i]) return false;
  }
  return true;
};
