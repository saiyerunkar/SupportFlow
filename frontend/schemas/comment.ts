export type Comment = {
  id: string;
  body: string;
  is_internal: boolean;
  author_id: string;
  ticket_id: string;
  created_at: string;
  updated_at: string;
};

export type CommentCreateInput = {
  body: string;
  is_internal?: boolean;
};