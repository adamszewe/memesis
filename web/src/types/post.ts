export interface Tag {
  Name: string;
}

export interface Post {
  Id: string;
  Title: string;
  Description: string;
  ImageUrl: string;
  Tags: Tag[];
  CreatedAt: string;
  UpdatedAt?: string;
}
