export type QueryParams = Record<string, string | number | boolean | undefined>;

export type RequestData = Record<string, unknown> | FormData | string | number | boolean;

export interface FileUploadData {
  [key: string]: string | number | boolean | File;
}

export interface PathParams {
  [key: string]: string | number;
}