"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import VideoPlayer from "@/components/components/VideoPlayer";

interface CourseDetail {
  courseId: string;
  title: string;
  description: string;
  overview: string;
  thumbnail: string;
  price: number;
  durationTime: number;
  approved: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  instructorId: string;
  instructor: {
    instructorId: string;
    userId: string;
    bio: string;
    profilePicture: string;
    experience: string;
    averageRating: number;
    isVerified: boolean;
    user: {
      userId: string;
      fullName: string;
      avatar: string;
    };
  };
  learningObjectives: {
    objectiveId: string;
    description: string;
  }[];
  requirements: {
    requirementId: string;
    description: string;
  }[];
  targetAudience: {
    audienceId: string;
    description: string;
  }[];
  modules: {
    moduleId: string;
    title: string;
    description: string;
    curricula: {
      curriculumId: string;
      title: string;
      type: string;
      description: string;
      lectures: {
        lectureId: string;
        title: string;
        description: string;
        videoUrl: string;
        duration: number;
        isFree: boolean;
      }[];
      quizzes: {
        quizId: string;
        title: string;
        description: string;
        passingScore: number;
        timeLimit: number;
        isFree: boolean;
        questions: {
          questionId: string;
          questionText: string;
          questionType: string;
          points: number;
          answers: {
            answerId: string;
            answerText: string;
            isCorrect: boolean;
          }[];
        }[];
      }[];
    }[];
  }[];
  reviews: {
    reviewId: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      userId: string;
      fullName: string;
      avatar: string;
    };
  }[];
  bestVoucher: {
    voucherId: string;
    code: string;
    discount: number;
    startDate: string;
    endDate: string;
  } | null;
  discountedPrice: number | null;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    data: CourseDetail;
  };
  statusCode: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    approved: "PENDING" as "PENDING" | "APPROVED" | "REJECTED",
  });

  useEffect(() => {
    fetchCourseDetail();
  }, [params.id]);

  const fetchCourseDetail = async () => {
    try {
      const response = await api.get<ApiResponse>(
        `/courses/detail/${params.id}`
      );
      setCourse(response.data.data.data);
      setFormData({
        approved: response.data.data.data.approved as
          | "PENDING"
          | "APPROVED"
          | "REJECTED",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin khóa học",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      console.log(formData);
      const response = await api.put(`/courses/${params.id}/status`, formData);
      console.log(response);
      toast({
        title: "Thành công",
        description: "Đã cập nhật trạng thái khóa học",
      });
      setUpdateDialogOpen(false);
      fetchCourseDetail();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${params.id}`);
      toast({
        title: "Thành công",
        description: "Đã xóa khóa học",
      });
      router.push("/courses");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể xóa khóa học",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!course) {
    return <div>Không tìm thấy thông tin khóa học</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Thông tin khóa học</CardTitle>
            <div className="flex gap-2">
              <Dialog
                open={updateDialogOpen}
                onOpenChange={setUpdateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Cập nhật trạng thái</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Cập nhật trạng thái</DialogTitle>
                    <DialogDescription>
                      Cập nhật trạng thái của khóa học. Nhấn lưu khi hoàn tất.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="approved" className="text-right">
                        Trạng thái
                      </Label>
                      <Select
                        value={formData.approved}
                        onValueChange={(
                          value: "PENDING" | "APPROVED" | "REJECTED"
                        ) => setFormData({ ...formData, approved: value })}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                          <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                          <SelectItem value="REJECTED">Từ chối</SelectItem>
                        </SelectContent>
                      </Select>
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
                      Bạn có chắc chắn muốn xóa khóa học này? Hành động này
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
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold">Tên khóa học</h3>
                <p>{course.title}</p>
              </div>
              <div>
                <h3 className="font-semibold">Mô tả</h3>
                <p>{course.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Tổng quan</h3>
                <p>{course.overview || "Chưa có"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Giảng viên</h3>
                <p>{course.instructor?.user?.fullName || "Chưa có"}</p>
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
                <h3 className="font-semibold">Thời lượng</h3>
                <p>{course.durationTime} phút</p>
              </div>
              <div>
                <h3 className="font-semibold">Trạng thái</h3>
                <Badge
                  variant={
                    course.approved === "APPROVED"
                      ? "default"
                      : course.approved === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {course.approved}
                </Badge>
              </div>
              <div>
                <h3 className="font-semibold">Đánh giá</h3>
                <p>{course.rating} sao</p>
              </div>
              <div>
                <h3 className="font-semibold">Ngày tạo</h3>
                <p>
                  {course.createdAt &&
                  !isNaN(new Date(course.createdAt).getTime())
                    ? format(new Date(course.createdAt), "PPP", { locale: vi })
                    : "Chưa có"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="objectives">
          <TabsList>
            <TabsTrigger value="objectives">Mục tiêu học tập</TabsTrigger>
            <TabsTrigger value="requirements">Yêu cầu</TabsTrigger>
            <TabsTrigger value="audience">Đối tượng</TabsTrigger>
            <TabsTrigger value="curriculum">Nội dung khóa học</TabsTrigger>
          </TabsList>

          <TabsContent value="objectives">
            <Card>
              <CardHeader>
                <CardTitle>Mục tiêu học tập</CardTitle>
              </CardHeader>
              <CardContent>
                {!course.learningObjectives ||
                course.learningObjectives.length === 0 ? (
                  <p>Chưa có mục tiêu học tập</p>
                ) : (
                  <ul className="list-disc pl-6">
                    {course.learningObjectives.map((objective) => (
                      <li key={objective.objectiveId}>
                        {objective.description}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requirements">
            <Card>
              <CardHeader>
                <CardTitle>Yêu cầu</CardTitle>
              </CardHeader>
              <CardContent>
                {!course.requirements || course.requirements.length === 0 ? (
                  <p>Chưa có yêu cầu</p>
                ) : (
                  <ul className="list-disc pl-6">
                    {course.requirements.map((requirement) => (
                      <li key={requirement.requirementId}>
                        {requirement.description}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card>
              <CardHeader>
                <CardTitle>Đối tượng</CardTitle>
              </CardHeader>
              <CardContent>
                {!course.targetAudience ||
                course.targetAudience.length === 0 ? (
                  <p>Chưa có thông tin đối tượng</p>
                ) : (
                  <ul className="list-disc pl-6">
                    {course.targetAudience.map((audience) => (
                      <li key={audience.audienceId}>{audience.description}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="curriculum">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                {!course.modules || course.modules.length === 0 ? (
                  <p>Chưa có nội dung khóa học</p>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Nội dung khóa học</h3>
                    {course?.modules.map((module) => (
                      <div key={module.moduleId} className="space-y-2">
                        <h4 className="font-medium">{module.title}</h4>
                        {module.curricula.map((curriculum) => (
                          <div
                            key={curriculum.curriculumId}
                            className="pl-4 space-y-2"
                          >
                            <h5 className="text-sm">{curriculum.title}</h5>
                            {curriculum.lectures.map((lecture) => (
                              <div key={lecture.lectureId} className="pl-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">
                                    {lecture.title}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {lecture.duration} phút
                                  </span>
                                </div>
                                {lecture.videoUrl && (
                                  <div className="mt-2">
                                    <VideoPlayer
                                      videoUrl={`http://localhost:9090/videos/${course.courseId}/${lecture.lectureId}.mp4`}
                                      lectureId={lecture.lectureId}
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
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
