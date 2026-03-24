export const UTCtoLocalDateConversion = (date: string) => {
    const dateFormat = new Date(date);
    const localDate = dateFormat.toLocaleDateString();

    return localDate;
  };