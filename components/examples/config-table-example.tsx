import type {
  SelectOption,
  TableConfig,
} from "@/components/config-table/types";
import ConfigurableTable from "@/components/config-table/components/config-table";
import { Car, Code, DollarSign, User, WrenchIcon } from "lucide-react";

export interface TestEmployee {
  id: string;
  name: string;
  active: boolean;
  join_date: string;
  age: number;
  email: string;
  department: string;
  skills: string[];
  address: string;
  performance_rating: number;
}

const TableExample: React.FC<{
  data: TestEmployee[];
}> = ({ data }) => {
  const newData: TestEmployee[] = data.map((item) => ({
    ...item,
    skills: ["React", "JS"],
  }));

  const mockFetchOptions = async (query: string): Promise<SelectOption[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock data
    const mockData = [
      { value: "apple", label: "Apple" },
      { value: "banana", label: "Banana" },
      { value: "cherry", label: "Cherry" },
      { value: "date", label: "Date" },
      { value: "elderberry", label: "Elderberry" },
      { value: "fig", label: "Fig" },
      { value: "grape", label: "Grape" },
      { value: "honeydew", label: "Honeydew" },
    ];

    // Filter results based on query
    return mockData.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase())
    );
  };

  const tableConfig: TableConfig<TestEmployee> = {
    data: newData,
    tableName: "Employee",
    columns: [
      {
        id: "id",
        accessorKey: "id",
        mutationKey: "id",
        header: "ID",
        type: "id",
      },
      {
        id: "name",
        accessorKey: "name",
        mutationKey: "name",
        header: "Name",
        type: "text",
        filtering: {
          enabled: true,
        },
      },
      {
        id: "department",
        accessorKey: "department",
        mutationKey: "department",
        header: "Department",
        type: "single-select",
        filtering: {
          enabled: true,
          filterType: "single-select",
          filterOptions: [
            {
              label: "HR",
              value: "HR",
            },
            {
              label: "Engineering",
              value: "Engineering",
            },
            {
              label: "Sales",
              value: "Sales",
            },
            {
              label: "Operations",
              value: "Operations",
            },
          ],
        },
        options: [
          {
            label: "HR",
            value: "HR",
            icon: User,
            color: { background: "#E0F7FA", text: "#006064" },
          },
          {
            label: "Engineering",
            value: "Engineering",
            icon: Car,
            color: { background: "#E8F5E9", text: "#1B5E20" },
          },
          {
            label: "Sales",
            value: "Sales",
            icon: DollarSign,
            color: { background: "#FFF3E0", text: "#E65100" },
          },
          {
            label: "Operations",
            value: "Operations",
            icon: WrenchIcon,
            color: { background: "#F3E5F5", text: "#4A148C" },
          },
        ],
      },
      {
        id: "skill",
        accessorKey: "skills",
        header: "Skills",
        mutationKey: "skills",
        type: "multi-select",
        filtering: {
          enabled: true,
          filterType: "auto-complete",
          asyncOptions: {
            fetchOptions: mockFetchOptions,
          },
        },
        options: [
          {
            value: "React",
            label: "React",
            color: { background: "#E3F2FD", text: "#0D47A1" },
            icon: Car,
          },
          {
            value: "JS",
            label: "JavaScript",
            color: { background: "#FFF8E1", text: "#FF6F00" },
            icon: Code,
          },
        ],
      },
    ],
    pagination: {
      enabled: true,
      pageSize: 5,
      pageSizeOptions: [5, 10, 20, 50],
      onPaginationChange: (value) => {
        console.log("From Parent -> Pagination changed:", value);
      },
    },
    sorting: {
      enabled: true,
      initialState: [{ id: "name", desc: false }],
      onColumnSortingChange: (value) => {
        console.log("From parent -> Column sorting changed:", value);
      },
    },
    columnVisibility: {
      enabled: true,
      initialState: {
        skills: false,
        address: false,
      },
      onColumnVisibilityChange: (value) => {
        console.log("From Parent -> Column visibility changed:", value);
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
      rowCreating: {
        enabled: true,
        autoSave: true,
        requiredFields: ["name"],
        defaultValues: {
          active: true,
          age: 18,
          department: "HR",
        },
      },
    },
  };

  return <ConfigurableTable config={tableConfig} isFetching={false} />;
};

export default TableExample;
