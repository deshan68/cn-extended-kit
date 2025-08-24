import type { TableConfig } from "@/components/config-table/types";
import ConfigurableTable from "../config-table/components/config-table";

export interface TestEmployee {
  id: number;
  name: string;
  active: boolean;
  join_date: string;
  age: number;
  email: string;
  department: string;
  address: string;
  performance_rating: number;
}

const TableExample: React.FC<{
  data: TestEmployee[];
}> = ({ data }) => {
  const tableConfig: TableConfig<TestEmployee> = {
    tableKey: "test_employee",
    data: data,
    columns: [
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        type: "text",
        sortable: true,
        filtering: {
          enabled: true,
          filterType: "text",
        },
        editable: true,
        placeholder: "Search names...",
        width: 60,
        validation: {
          required: true,
        },
      },
      {
        id: "email",
        header: "Email",
        accessorKey: "email",
        type: "text",
        sortable: true,
        filtering: {
          enabled: true,
          filterType: "text",
        },
        editable: true,
        placeholder: "Search emails...",
        width: 60,
        validation: {
          required: true,
        },
      },
      {
        id: "department",
        header: "Department",
        accessorKey: "department",
        type: "select",
        options: [
          { value: "HR", label: "HR" },
          { value: "Engineering", label: "Engineering" },
          { value: "Sales", label: "Sales" },
          { value: "Marketing", label: "Marketing" },
          { value: "Finance", label: "Finance" },
          { value: "Support", label: "Support" },
        ],
        sortable: true,
        filtering: {
          enabled: true,
          filterType: "select",
          filterOptions: [
            { value: "HR", label: "HR" },
            { value: "Engineering", label: "Engineering" },
            { value: "Sales", label: "Sales" },
            { value: "Marketing", label: "Marketing" },
            { value: "Finance", label: "Finance" },
            { value: "Support", label: "Support" },
          ],
        },
        editable: true,
        placeholder: "Search departments...",
        width: 60,
      },
      {
        id: "age",
        header: "Age",
        accessorKey: "age",
        type: "number",
        sortable: true,
        editable: true,
        filtering: {
          enabled: true,
          filterType: "number",
        },
        width: 50,
        validation: {
          required: true,
          min: 18,
          max: 99,
        },
      },
      {
        id: "active",
        header: "Active",
        accessorKey: "active",
        type: "boolean",
        sortable: true,
        editable: true,
        width: 100,
      },
      {
        id: "address",
        header: "Address",
        accessorKey: "address",
        type: "text",
        sortable: true,
        editable: true,
        filtering: {
          enabled: true,
          filterType: "text",
        },
        placeholder: "Enter address...",
        width: 150,
        validation: {
          required: true,
        },
      },
      {
        id: "performance_rating",
        header: "Rating",
        accessorKey: "performance_rating",
        type: "number",
        sortable: true,
        editable: true,
        width: 50,
        validation: {
          required: true,
          min: 1,
          max: 5,
        },
      },
      {
        id: "join_date",
        header: "Join Date",
        accessorKey: "join_date",
        type: "date",
        sortable: true,
        editable: true,
        filtering: {
          enabled: true,
          filterType: "date",
        },
      },
    ],
    pagination: {
      enabled: true,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
      onPaginationChange: (pagination) => {
        console.log("From Parent -> Pagination changed:", pagination);
      },
    },
    sorting: {
      enabled: true,
      onColumnSortingChange: (value) => {
        console.log("From parent -> Column sorting changed:", value);
      },
    },
    filtering: {
      enabled: true,
      globalSearch: true,
      onGlobalFilterChange: (value) => {
        console.log("From Parent", value);
      },
      onColumnFilterChange: (value) => {
        console.log("From Parent -> Column filter changed:", value);
      },
    },
    editing: {
      enabled: true,
      apiBaseUrl: "https://dev-pg-rest-clone-test.lvx5rv.easypanel.host",
      idField: "id",
      rowCreating: {
        enabled: true,
        requiredFields: ["name"],
        autoSave: true,
        defaultValues: {
          active: true,
          age: 18,
          department: "HR",
        },
      },

      columnUpdating: {
        customUpdateHandler: async (
          rowData,
          columnId,
          newValue,
          oldValue,
          tableAPI
        ) => {
          console.log("Custom update handler called:", {
            columnId,
            newValue,
            oldValue,
          });
          await tableAPI.updateCell(rowData, columnId, newValue);

          return true;
        },

        beforeUpdate: async (rowData, columnId, newValue) => {
          console.log("Before update:", { columnId, newValue, rowData });

          return true;
        },

        afterUpdate: async (rowData, columnId, newValue, responses) => {
          console.log("After update completed:", {
            rowData,
            columnId,
            newValue,
            responses,
          });
        },
      },

      onCellEdit: async (rowIndex, columnId, newValue, oldValue, rowData) => {
        console.log("Cell edited:", {
          tableKey: "employees",
          rowId: rowData.id,
          rowIndex,
          columnId,
          newValue,
          oldValue,
          apiEndpoint: `/api/employees/${rowData.id}`,
          rowData,
        });

        if (columnId === "age" && newValue < 18) {
          throw new Error("Age must be at least 18");
        }

        return true;
      },

      onApiError: (error, context) => {
        console.error("API Error:", error, context);
      },
    },
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <ConfigurableTable config={tableConfig} />
    </div>
  );
};

export default TableExample;
