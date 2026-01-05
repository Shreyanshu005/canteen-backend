export const isCanteenOpen = (canteen: any): boolean => {
    if (!canteen.isOpen) return false;
    if (!canteen.openingTime || !canteen.closingTime) return true;

    const now = new Date();
    const istOption: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-GB', istOption);
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');

    const currentH = hourPart ? hourPart.value : '0';
    const currentM = minutePart ? minutePart.value : '0';

    const currentTimeValue = parseInt(currentH) * 60 + parseInt(currentM);

    const [openH = 0, openM = 0] = canteen.openingTime.split(':').map(Number);
    const openTimeValue = openH * 60 + openM;

    const [closeH = 0, closeM = 0] = canteen.closingTime.split(':').map(Number);
    const closeTimeValue = closeH * 60 + closeM;

    return currentTimeValue >= openTimeValue && currentTimeValue <= closeTimeValue;
};
