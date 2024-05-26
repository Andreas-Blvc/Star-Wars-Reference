export const isAvailable = (value: any): boolean => {
    const isFalsy = !value;
    return !(isFalsy || value === 'n/a' || value === 'none');
};