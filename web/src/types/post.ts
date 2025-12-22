export interface Category {
  Name: string;
}

export interface Post {
  Id: string;
  Title: string;
  Description: string;
  ImageUrl: string;
  Categories: Category[];
  CreatedAt: string;
  UpdatedAt?: string;
}
