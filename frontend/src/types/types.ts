export enum Category {
    COMMUNICATION = "community"
    , DISASTER = "disaster"
    ,ENTERTAINMENT = "entertainment"
}
export enum ContentType{
    EVENT="event" ,
    THREAD="thread",
    POST = "post"
}
export type Coordinate= {
  lat: number;
  lng: number;
}
export const CATEGORY_OPTIONS = [
  { value: 'entertainment' as const, label: 'エンターテイメント' },
  { value: 'community' as const, label: '地域住民コミュニケーション' },
  { value: 'disaster' as const, label: '災害情報' }
];

// マップ制御関数の型
export interface MapControlFunctions {
  toggle3D: () => void;
  changeMapView: (view: number) => void;
}
export interface HeatMapFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    mag: number;
  };
}

export interface HeatMapGeoJSON {
  type: "FeatureCollection";
  features: HeatMapFeature[];
}

export interface HeatMapData {
  geojson: HeatMapGeoJSON;
  summary: string;
}