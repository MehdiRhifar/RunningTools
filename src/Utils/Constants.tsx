interface DistanceDetail {
    distance: number;
    name: string;
}

export interface Distance<T> {
    Marathon : T,
    SemiMarathon : T,
    km10 : T
}

export interface DistanceInfo extends Distance<DistanceDetail> {}
export const distancesInfo : DistanceInfo = {
    Marathon: { distance: 42_195, name: "Marathon" },
    SemiMarathon: { distance: 21_098, name: "Semi Marathon" },
    km10: { distance: 10_000, name: "10 km" },
    // Ajoutez d'autres distances ici
};