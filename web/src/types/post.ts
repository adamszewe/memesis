export interface Tag {
  Name: string;
}

export interface Post {
  ID: number;
  Title: string;
  Description: string;
  ImageUrl: string;
  Tags: Tag[];
  CreatedAt: string;
  UpdatedAt: string;
}
