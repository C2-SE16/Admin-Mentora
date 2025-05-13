"use client";

import { useState, useEffect } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Category, ApiResponse, PaginatedResponse } from "@/types/category";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

interface CategoryResponse {
  success: boolean;
  message: string;
  data: {
    data: Category[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface CategoryActionResponse {
  data: {
    data: {
      data: {
        categoryId: string;
        name: string;
        description: string | null;
        createdAt: string | null;
        updatedAt: string | null;
      };
      message: string;
      success: boolean;
    };
    statusCode: number;
  };
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<CategoryResponse>>(
        "/categories",
        {
          params: {
            page,
            limit: 10,
          },
        }
      );
      console.log("API Response:", response);

      if (!response.data?.data?.data?.data) {
        throw new Error("Invalid response structure");
      }

      const validCategories = response.data.data.data.data;
      console.log("Valid Categories:", validCategories);

      if (validCategories.length === 0) {
        toast.warning("Không có danh mục hợp lệ nào");
      }

      setCategories(validCategories);
      console.log("Categories:", categories);

      if (!response.data?.data?.data?.meta?.totalPages) {
        throw new Error("Invalid meta data structure");
      }

      setTotalPages(response.data.data.data.meta.totalPages);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Không thể tải danh sách danh mục");
      setCategories([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const response = await api.post("/categories", {
        name: newCategoryName.trim(),
      });
      console.log(response);
      if (response.data.data.success) {
        toast.success("Tạo danh mục thành công");
        setIsCreateDialogOpen(false);
        setNewCategoryName("");
        fetchCategories();
      } else {
        toast.error(response.data.data.message || "Không thể tạo danh mục");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Không thể tạo danh mục");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !newCategoryName.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      const response = await api.put(
        `/categories/${selectedCategory.categoryId}`,
        {
          name: newCategoryName.trim(),
        }
      );
      console.log(response);
      if (response.data.data.success) {
        toast.success("Cập nhật danh mục thành công");
        setIsEditDialogOpen(false);
        setSelectedCategory(null);
        setNewCategoryName("");
        fetchCategories();
      } else {
        toast.error(
          response.data.data.message || "Không thể cập nhật danh mục"
        );
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Không thể cập nhật danh mục");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      return;
    }

    try {
      const response = await api.delete(`/categories/${categoryId}`);

      if (response.data.data.success) {
        toast.success("Xóa danh mục thành công");
        fetchCategories();
      } else {
        toast.error(response.data.data.message || "Không thể xóa danh mục");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Không thể xóa danh mục");
    }
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name || "");
    setIsEditDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Tạo danh mục mới</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo danh mục mới</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="categoryName">Tên danh mục</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <Button onClick={handleCreateCategory}>Tạo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tên danh mục</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Ngày cập nhật</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Không có danh mục nào
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.categoryId}>
                  <TableCell>{category.categoryId}</TableCell>
                  <TableCell>{category.name || "Chưa có tên"}</TableCell>
                  <TableCell>
                    {category.createdAt
                      ? new Date(category.createdAt).toLocaleDateString("vi-VN")
                      : "Chưa có ngày tạo"}
                  </TableCell>
                  <TableCell>
                    {category.updatedAt
                      ? new Date(category.updatedAt).toLocaleDateString("vi-VN")
                      : "Chưa có ngày cập nhật"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleEditClick(category)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => handleDeleteCategory(category.categoryId)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa danh mục</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">Tên danh mục</Label>
              <Input
                id="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
            </div>
            <Button onClick={handleUpdateCategory}>Cập nhật</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
