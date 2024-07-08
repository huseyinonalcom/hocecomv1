export function addDaysToDate(dateStr: string, daysToAdd: number) {
    // Parse the string to a Date object
    const date = new Date(dateStr);
  
    // Add the specified number of days
    date.setDate(date.getDate() + daysToAdd);
  
    // Format the new Date object back to a string
    return date; // or any other desired format
  }