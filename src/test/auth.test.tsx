import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthContext } from "@/contexts/AuthContext";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when user is authenticated", () => {
    render(
      <AuthContext.Provider
        value={{
          user: { id: "123" } as any,
          loading: false,
          session: null,
          signUp: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
        }}
      >
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText("Protected Content")).toBeTruthy();
  });

  it("redirects to /auth when unauthenticated", async () => {
    render(
      <AuthContext.Provider
        value={{
          user: null,
          loading: false,
          session: null,
          signUp: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
        }}
      >
        <MemoryRouter initialEntries={["/dashboard"]}>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining("/auth"),
        expect.any(Object)
      );
    });
  });
});
