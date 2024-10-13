type Course = {
    name: string;
    price: number;
    diets: string;
};

type DailyMenu = {
    courses: Course[];
};

type Day = DailyMenu & {date: string};

type WeeklyMenu = {
    days: Day[];
};

export type { Course, DailyMenu, Day, WeeklyMenu };