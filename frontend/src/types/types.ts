export enum Category {
    COMMUNICATION = "communication"
    , DISASTER = "disaster"
    ,ENTERTAINMENT = "entertainment"
}
export enum ContentType{
    EVENT="event" ,
    THREAD="thread",
    POST = "post"
}
export interface Coordinate {
  lat: number;
  lng: number;
}


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