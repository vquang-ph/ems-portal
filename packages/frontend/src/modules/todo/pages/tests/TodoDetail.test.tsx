import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useParams } from "@tanstack/react-router";
import TodoDetail from "../TodoDetail";
import useTodoQuery from "../../hooks/queries/useTodoQuery";
import { mockedSingleTodo, TODO_DETAIL_TEST_IDS } from "../../test";
import { UI_COMPONENTS_TEST_IDS } from "@/test/testIds";

const TEXT = {
  loading: "Loading...",
} as const;

vi.mock("@tanstack/react-router", () => ({
  useParams: vi.fn(),
}));

vi.mock("../../hooks/queries/useTodoQuery", () => ({
  default: vi.fn(),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.card}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.cardContent}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.cardHeader}>{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.cardTitle}>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid={UI_COMPONENTS_TEST_IDS.cardDescription}>{children}</div>
  ),
}));

vi.mock("../../components/TodoNotFound.tsx", () => ({
  default: () => (
    <div data-testid={TODO_DETAIL_TEST_IDS.notFound}>Todo not found</div>
  ),
}));

vi.mock("../../components/TodoDetailHeader.tsx", () => ({
  default: ({
    id,
    title,
    status,
  }: {
    id: string;
    title: string;
    status: string;
  }) => (
    <div data-testid={TODO_DETAIL_TEST_IDS.header}>
      <div data-testid={TODO_DETAIL_TEST_IDS.headerId}>{id}</div>
      <div data-testid={TODO_DETAIL_TEST_IDS.headerTitle}>{title}</div>
      <div data-testid={TODO_DETAIL_TEST_IDS.headerStatus}>{status}</div>
    </div>
  ),
}));

vi.mock("../../components/TodoInfo.tsx", () => ({
  default: ({
    description,
    createdAt,
    status,
  }: {
    description: string;
    createdAt: Date;
    status: string;
  }) => (
    <div data-testid={TODO_DETAIL_TEST_IDS.info}>
      <div data-testid={TODO_DETAIL_TEST_IDS.infoDescription}>
        {description}
      </div>
      <div data-testid={TODO_DETAIL_TEST_IDS.infoCreatedAt}>
        {createdAt instanceof Date
          ? createdAt.toISOString()
          : String(createdAt)}
      </div>
      <div data-testid={TODO_DETAIL_TEST_IDS.infoStatus}>{status}</div>
    </div>
  ),
}));

vi.mock("../../components/TodoEditDialog.tsx", () => ({
  default: ({ todo }: { todo: { id: string } }) => (
    <div data-testid={TODO_DETAIL_TEST_IDS.editDialog}>{todo.id}</div>
  ),
}));

const useParamsMock = vi.mocked(useParams);
const useTodoQueryMock = vi.mocked(useTodoQuery);

describe("TodoDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Loading... when query is loading", () => {
    useParamsMock.mockReturnValue({ todoId: "abc" } as ReturnType<
      typeof useParams
    >);

    useTodoQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useTodoQuery>);

    render(<TodoDetail />);

    expect(screen.getByText(TEXT.loading)).toBeInTheDocument();
    expect(
      screen.queryByTestId(TODO_DETAIL_TEST_IDS.notFound),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.card),
    ).not.toBeInTheDocument();
  });

  it("renders TodoNotFound when not loading and todo is missing", () => {
    useParamsMock.mockReturnValue({ todoId: "missing" } as ReturnType<
      typeof useParams
    >);

    useTodoQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as ReturnType<typeof useTodoQuery>);

    render(<TodoDetail />);

    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.notFound),
    ).toBeInTheDocument();
    expect(screen.queryByText(TEXT.loading)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(UI_COMPONENTS_TEST_IDS.card),
    ).not.toBeInTheDocument();
  });

  it("renders todo details when todo exists", () => {
    useParamsMock.mockReturnValue({ todoId: mockedSingleTodo.id } as ReturnType<
      typeof useParams
    >);

    useTodoQueryMock.mockReturnValue({
      data: mockedSingleTodo,
      isLoading: false,
    } as ReturnType<typeof useTodoQuery>);

    render(<TodoDetail />);

    expect(screen.getByTestId(UI_COMPONENTS_TEST_IDS.card)).toBeInTheDocument();

    expect(screen.getByTestId(TODO_DETAIL_TEST_IDS.header)).toBeInTheDocument();
    expect(screen.getByTestId(TODO_DETAIL_TEST_IDS.headerId)).toHaveTextContent(
      mockedSingleTodo.id,
    );
    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.headerTitle),
    ).toHaveTextContent(mockedSingleTodo.title);
    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.headerStatus),
    ).toHaveTextContent(mockedSingleTodo.status);

    expect(
      screen.getByTestId(UI_COMPONENTS_TEST_IDS.cardContent),
    ).toBeInTheDocument();
    expect(screen.getByTestId(TODO_DETAIL_TEST_IDS.info)).toBeInTheDocument();
    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.infoDescription),
    ).toHaveTextContent(mockedSingleTodo.description);
    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.infoCreatedAt),
    ).toHaveTextContent(mockedSingleTodo.createdAt.toISOString());
    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.infoStatus),
    ).toHaveTextContent(mockedSingleTodo.status);

    expect(
      screen.getByTestId(TODO_DETAIL_TEST_IDS.editDialog),
    ).toHaveTextContent(mockedSingleTodo.id);

    expect(screen.queryByText(TEXT.loading)).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(TODO_DETAIL_TEST_IDS.notFound),
    ).not.toBeInTheDocument();
  });

  it("calls useTodoQuery with todoId from router params", () => {
    const mockedRouterId = "router-id";

    useParamsMock.mockReturnValue({ todoId: mockedRouterId } as ReturnType<
      typeof useParams
    >);

    useTodoQueryMock.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useTodoQuery>);

    render(<TodoDetail />);

    expect(useTodoQueryMock).toHaveBeenCalledTimes(1);
    expect(useTodoQueryMock).toHaveBeenCalledWith(mockedRouterId);
  });
});
