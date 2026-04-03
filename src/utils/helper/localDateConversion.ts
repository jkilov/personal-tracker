export const UTCtoLocalDateConversion = (date: string) => {
    const dateFormat = new Date(date);
    const localDate = dateFormat.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    return localDate;
  };

