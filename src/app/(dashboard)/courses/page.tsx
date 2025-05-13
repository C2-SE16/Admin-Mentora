"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CourseSortBy, SortOrder } from "@/types/course";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface Course {
  courseId: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  user: {
    userId: string;
    fullName: string;
    avatar: string;
  };
  category: {
    categoryId: string;
    name: string;
  };
}

interface ApiResponse {
  data: {
    data: Course[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<CourseSortBy>(CourseSortBy.CREATED_AT);
  const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.DESC);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const fetchCourses = async () => {
    try {
      const response = await api.get<ApiResponse>("/courses", {
        params: {
          page,
          limit: 10,
          search,
          sortBy,
          sortOrder,
        },
      });
      console.log("API Response:", response.data);
      setCourses(response.data.data.data || []);
      setTotalPages(response.data.data.meta.totalPages);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [page, search, sortBy, sortOrder]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortByChange = (value: CourseSortBy) => {
    setSortBy(value);
    setPage(1);
  };

  const handleSortOrderChange = (value: SortOrder) => {
    setSortOrder(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách khóa học</h1>
        <Button onClick={() => router.push("/courses/create")}>
          Thêm khóa học
        </Button>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-6">
          {courses.map((course) => (
            <Card key={course.courseId}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{course.title}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courses/${course.courseId}`)}
                  >
                    Chi tiết
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div>
                    <h3 className="font-semibold">Mô tả</h3>
                    <p>{course.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Giảng viên</h3>
                    <p>{course.user?.fullName || "Chưa có"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Danh mục</h3>
                    <p>{course.category?.name || "Chưa có"}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Giá</h3>
                    <p>
                      {course.price
                        ? course.price.toLocaleString("vi-VN") + "đ"
                        : "Miễn phí"}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Ngày tạo</h3>
                    <p>
                      {course.createdAt &&
                      !isNaN(new Date(course.createdAt).getTime())
                        ? format(new Date(course.createdAt), "PPP", {
                            locale: vi,
                          })
                        : "Chưa có"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>Không có khóa học nào</div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={page === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
