"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserDetail {
  userId: string;
  email: string;
  fullName: string;
  avatar: string;
  role: string;
  title: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  websiteLink: string | null;
  facebookLink: string | null;
  youtubeLink: string | null;
  linkedinLink: string | null;
  isEmailVerified: boolean;
  tbl_instructors: any[];
  tbl_course_enrollments: any[];
  tbl_course_reviews: any[];
  tbl_payment: any[];
  tbl_favorites: any[];
  password?: string;
  resetPasswordToken?: string | null;
  resetPasswordTokenExp?: string | null;
  verificationEmailToken?: string;
  verificationEmailTokenExp?: string;
}

interface ApiResponse {
  data: UserDetail;
  statusCode: number;
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "Chưa có";
  try {
    return format(new Date(dateString), "PPP", { locale: vi });
  } catch (error) {
    return "Ngày không hợp lệ";
  }
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "",
    title: "",
    description: "",
    websiteLink: "",
    facebookLink: "",
    youtubeLink: "",
    linkedinLink: "",
    isEmailVerified: false,
  });

  useEffect(() => {
    fetchUserDetail();
  }, [params.id, toast]);
  const fetchUserDetail = async () => {
    try {
      const response = await api.get<ApiResponse>(`/user/${params.id}/admin`);
      setUser(response.data.data);
      setFormData({
        email: response.data.data.email,
        password: "",
        fullName: response.data.data.fullName,
        role: response.data.data.role,
        title: response.data.data.title || "",
        description: response.data.data.description || "",
        websiteLink: response.data.data.websiteLink || "",
        facebookLink: response.data.data.facebookLink || "",
        youtubeLink: response.data.data.youtubeLink || "",
        linkedinLink: response.data.data.linkedinLink || "",
        isEmailVerified: response.data.data.isEmailVerified,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const dataToSend = {
        ...formData,
        password: formData.password || undefined,
      };

      await api.put(`/user/${params.id}/admin`, dataToSend);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin người dùng",
      });
      setUpdateDialogOpen(false);
      fetchUserDetail();
    } catch (error: any) {
      console.error("Update error:", error.response?.data);
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật thông tin",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/user/${params.id}/admin`);
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng",
      });
      router.push("/users");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể xóa người dùng",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <div>Không tìm thấy thông tin người dùng</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Thông tin người dùng</CardTitle>
            <div className="flex gap-2">
              <Dialog
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Cập nhật</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cập nhật thông tin</DialogTitle>
                    <DialogDescription>
                      Cập nhật thông tin người dùng. Nhấn lưu khi hoàn tất.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="col-span-3"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="password" className="text-right">
                        Mật khẩu
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        className="col-span-3"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        placeholder="Để trống nếu không muốn thay đổi"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="fullName" className="text-right">
                        Họ tên
                      </Label>
                      <Input
                        id="fullName"
                        className="col-span-3"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Vai trò
                      </Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) =>
                          setFormData({ ...formData, role: value })
                        }
                        required
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                          <SelectItem value="INSTRUCTOR">Giảng viên</SelectItem>
                          <SelectItem value="STUDENT">Học viên</SelectItem>
                          <SelectItem value="SUPPORT_STAFF">
                            Nhân viên hỗ trợ
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Tiêu đề
                      </Label>
                      <Input
                        id="title"
                        className="col-span-3"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Mô tả
                      </Label>
                      <Input
                        id="description"
                        className="col-span-3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="websiteLink" className="text-right">
                        Website
                      </Label>
                      <Input
                        id="websiteLink"
                        className="col-span-3"
                        value={formData.websiteLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            websiteLink: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="facebookLink" className="text-right">
                        Facebook
                      </Label>
                      <Input
                        id="facebookLink"
                        className="col-span-3"
                        value={formData.facebookLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facebookLink: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="youtubeLink" className="text-right">
                        YouTube
                      </Label>
                      <Input
                        id="youtubeLink"
                        className="col-span-3"
                        value={formData.youtubeLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            youtubeLink: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="linkedinLink" className="text-right">
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedinLink"
                        className="col-span-3"
                        value={formData.linkedinLink}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            linkedinLink: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="isEmailVerified" className="text-right">
                        Xác thực email
                      </Label>
                      <div className="col-span-3">
                        <Select
                          value={formData.isEmailVerified ? "true" : "false"}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              isEmailVerified: value === "true",
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Đã xác thực</SelectItem>
                            <SelectItem value="false">Chưa xác thực</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={handleUpdate}>
                      Lưu thay đổi
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Xóa</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                    <AlertDialogDescription>
                      Bạn có chắc chắn muốn xóa người dùng này? Hành động này
                      không thể hoàn tác.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Xóa
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user.fullName}</h2>
                <p className="text-gray-500">{user.email}</p>
                <Badge
                  variant={user.role === "ADMIN" ? "destructive" : "default"}
                >
                  {user.role}
                </Badge>
              </div>
            </div>
            <div className="mt-4 grid gap-4">
              <div>
                <h3 className="font-semibold">Tiêu đề</h3>
                <p>{user.title || "Chưa có"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Mô tả</h3>
                <p>{user.description || "Chưa có"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Liên kết</h3>
                <div className="flex gap-2">
                  {user.websiteLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={user.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    </Button>
                  )}
                  {user.facebookLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={user.facebookLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Facebook
                      </a>
                    </Button>
                  )}
                  {user.youtubeLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={user.youtubeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        YouTube
                      </a>
                    </Button>
                  )}
                  {user.linkedinLink && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={user.linkedinLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Trạng thái email</h3>
                <Badge
                  variant={user.isEmailVerified ? "default" : "destructive"}
                >
                  {user.isEmailVerified ? "Đã xác thực" : "Chưa xác thực"}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Ngày tạo</h3>
                <p>{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">Khóa học đã đăng ký</TabsTrigger>
            <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            <TabsTrigger value="payments">Thanh toán</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <Card>
              <CardHeader>
                <CardTitle>Khóa học đã đăng ký</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.tbl_course_enrollments ||
                user.tbl_course_enrollments.length === 0 ? (
                  <p>Chưa đăng ký khóa học nào</p>
                ) : (
                  <div className="grid gap-4">
                    {user.tbl_course_enrollments.map((enrollment) => (
                      <div
                        key={enrollment.courseEnrollmentId}
                        className="flex items-center gap-4"
                      >
                        <div>
                          <h4 className="font-semibold">
                            {enrollment.tbl_courses?.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Đăng ký ngày: {formatDate(enrollment.enrolledAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.tbl_course_reviews ||
                user.tbl_course_reviews.length === 0 ? (
                  <p>Chưa có đánh giá nào</p>
                ) : (
                  <div className="grid gap-4">
                    {user.tbl_course_reviews.map((review) => (
                      <div
                        key={review.reviewId}
                        className="flex items-start gap-4"
                      >
                        <div>
                          <h4 className="font-semibold">
                            {review.tbl_courses?.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge>{review.rating} sao</Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Lịch sử thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.tbl_payment || user.tbl_payment.length === 0 ? (
                  <p>Chưa có giao dịch nào</p>
                ) : (
                  <div className="grid gap-4">
                    {user.tbl_payment.map((payment) => (
                      <div
                        key={payment.paymentId}
                        className="flex items-center gap-4"
                      >
                        <div>
                          <h4 className="font-semibold">
                            {payment.paymentMethod} - {payment.amount} VND
                          </h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                payment.status === "COMPLETED"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {payment.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(payment.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Khóa học yêu thích</CardTitle>
              </CardHeader>
              <CardContent>
                {!user.tbl_favorites || user.tbl_favorites.length === 0 ? (
                  <p>Chưa có khóa học yêu thích nào</p>
                ) : (
                  <div className="grid gap-4">
                    {user.tbl_favorites.map((favorite) => (
                      <div
                        key={favorite.favoriteId}
                        className="flex items-center gap-4"
                      >
                        <div>
                          <h4 className="font-semibold">
                            {favorite.tbl_courses?.title}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
