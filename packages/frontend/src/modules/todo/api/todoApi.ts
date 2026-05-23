import { apiClient } from "@/lib/apiClient";
import { parseObjectWithDates } from "@/utils/parseObjectWithDates";
import {
  AffectedResponse,
  Todo,
  TodoCreate,
  TodoUpdate,
} from "@ems-portal/types";

const todoApi = {
  async getAll(): Promise<Todo[]> {
    const res = await apiClient.get<Todo[]>("/todos");

    return parseObjectWithDates<Todo[]>(res.data);
  },

  async getById(id: string): Promise<Todo> {
    const res = await apiClient.get<Todo>(`/todos/${id}`);

    return parseObjectWithDates<Todo>(res.data);
  },

  async create(input: TodoCreate): Promise<Todo> {
    const res = await apiClient.post<Todo>("/todos", input);

    return parseObjectWithDates<Todo>(res.data);
  },

  async update(id: string, input: TodoUpdate): Promise<AffectedResponse> {
    const res = await apiClient.patch<AffectedResponse>(`/todos/${id}`, input);

    return res.data;
  },

  async remove(id: string): Promise<AffectedResponse> {
    const res = await apiClient.delete<AffectedResponse>(`/todos/${id}`);

    return res.data;
  },
} as const;

export default todoApi;
