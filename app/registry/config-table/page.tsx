/* eslint-disable react/no-children-prop */
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { CodeBlock } from "@/components/code-block";
import TableExample from "@/components/examples/config-table-example";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import React, { useEffect, useState } from "react";

function ConfigTable() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://dev-pg-rest-clone-test.lvx5rv.easypanel.host/test_employee")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setEmployees(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SidebarTrigger className="ml-1" />
        <div className="p-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <TableExample data={employees} />
          )}
          <CodeBlock
            children="npx shadcn@latest add https://component-kit-6ko.pages.dev/r/config-table.json"
            title="Example Code"
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default ConfigTable;
