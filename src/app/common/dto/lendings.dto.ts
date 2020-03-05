export interface Lending {
    id?: string;
    itemId: any;
    itemName: string;
    userId: string;
    userName: string;
    itemType: string;
    startDate: number;
    endDate: number;
    active: boolean;
    late: boolean;
}
