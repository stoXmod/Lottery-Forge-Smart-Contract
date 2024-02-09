const handleContractError = (error: any) => {
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    if (typeof error.error.body === 'string') {
      try {
        const errorData = JSON.parse(error.error.body);
        if (errorData.error && errorData.error.message) {
         return errorData.error.message;
        }
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
      }
    }
  } else {
      return error.message;
  }
}

export default handleContractError;