import * as Pagination from "@/components/ui/pagination";

export default function PaginationDemo() {
  return (
    <Pagination.Root>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous href="#page-1" />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#page-1">1</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#page-2" isActive>
            2
          </Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#page-3">3</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#page-3" />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}
