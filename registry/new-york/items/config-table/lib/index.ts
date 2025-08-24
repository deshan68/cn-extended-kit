/* eslint-disable @typescript-eslint/no-explicit-any */
export // Enhanced API utility class for complex scenarios
class TableAPI<TData> {
  private baseUrl: string;
  private tableKey: string;
  private idField: keyof TData;

  constructor(
    tableKey: string,
    baseUrl: string = "/api",
    idField: keyof TData = "id" as keyof TData
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.tableKey = tableKey;
    this.idField = idField;
  }

  // Build API endpoint for table operations
  private getEndpoint(id?: TData[keyof TData]): string {
    const endpoint = `${this.baseUrl}/${this.tableKey}`;
    return id ? `${endpoint}?id=eq.${id as string}` : endpoint;
  }

  // Generic API call method
  async makeRequest(endpoint: string, options: RequestInit): Promise<any> {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // Handle different response types
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Update a single cell/field
  async updateCell(
    rowData: TData,
    columnId: keyof TData,
    newValue: any
  ): Promise<boolean> {
    const id = rowData[this.idField];
    if (!id) {
      throw new Error(
        `Row missing ${this.idField as string} field for API update`
      );
    }

    await this.makeRequest(this.getEndpoint(id), {
      method: "PATCH",
      body: JSON.stringify({ [columnId]: newValue }),
    });

    return true;
  }

  // Custom endpoint update
  async updateWithCustomEndpoint(
    endpoint: string,
    method: "POST" | "PATCH" | "PUT" | "DELETE",
    body: any,
    headers?: Record<string, string>
  ): Promise<any> {
    return await this.makeRequest(endpoint, {
      method,
      body: JSON.stringify(body),
      headers,
    });
  }

  // Batch update multiple rows/cells
  async batchUpdate(
    updates: Array<{
      id: string | number;
      data: Record<string, any>;
    }>,
    customEndpoint?: string
  ): Promise<any> {
    const endpoint = customEndpoint || `${this.getEndpoint()}/batch`;

    return await this.makeRequest(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ updates }),
    });
  }

  // Transaction-based updates
  async executeTransaction(
    operations: Array<{
      endpoint: string;
      method: string;
      body: any;
    }>,
    transactionEndpoint?: string
  ): Promise<any> {
    const endpoint = transactionEndpoint || `${this.baseUrl}/transaction`;

    return await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({ operations }),
    });
  }

  // Update entire row
  async updateRow(rowData: TData, updates: Partial<TData>): Promise<boolean> {
    const id = rowData[this.idField];
    if (!id) {
      throw new Error(
        `Row missing ${this.idField as string} field for API update`
      );
    }

    await this.makeRequest(this.getEndpoint(id), {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    return true;
  }

  // Create new row
  async createRow(data: Record<string, any>): Promise<any> {
    return await this.makeRequest(this.getEndpoint(), {
      method: "POST",
      headers: {
        Prefer: "return=representation",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  }

  // Delete row
  async deleteRow(rowData: TData): Promise<boolean> {
    const id = rowData[this.idField];
    if (!id) {
      throw new Error(
        `Row missing ${this.idField as string} field for API delete`
      );
    }

    await this.makeRequest(this.getEndpoint(id), {
      method: "DELETE",
    });

    return true;
  }

  // Fetch table data
  async fetchData(params?: Record<string, any>): Promise<any> {
    const url = new URL(this.getEndpoint(), window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return await this.makeRequest(url.toString(), { method: "GET" });
  }
}
