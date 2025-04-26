import React, { useEffect, useState } from "react";
import apiClient from "@/utils/appClient";
import { useToast } from "@/hooks/use-toast";
import { useAuthContext } from "@/hooks/useAuthContext";
import { Bell, Calendar } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Notice = {
  user_id: string;
  title: string;
  message: string;
  created_at: Date;
};

const NoticeSection = ({ userId }: { userId: string }) => {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const projectPerPage = 6;
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(projectPerPage);
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [pages, setPages] = useState<number[]>([1]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const calculatePages = (totalProjects: number) => {
    const totalPages = Math.ceil(totalProjects / projectPerPage);
    // console.log(totalProjects);
    const temp: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      temp.push(i);
    }

    return temp;
  };

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await apiClient.get(`/user_notices/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
        });

        const fetchedNotices = response.data.data.map((notice: Notice) => ({
          ...notice,
          created_at: new Date(notice.created_at),
        }));

        const sortedNotices = fetchedNotices.sort((a, b) => {
          return b.created_at.getTime() - a.created_at.getTime();
        });

        setNotices(sortedNotices);
        setPages(calculatePages(sortedNotices.length));
      } catch (error) {
        // setError("Failed to fetch notices" + error);
        toast({ description: "Failed to load notices", duration: 3000 });
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [userId, user?.token, toast]);

  useEffect(() => {
    const eIndex = Math.max(currentPageNo * projectPerPage, 0);
    const sIndex = Math.min(eIndex - projectPerPage, notices.length);

    setStartIndex(sIndex);
    setEndIndex(eIndex);
  }, [currentPageNo]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-4">
      {notices.length === 0 ? (
        <div className="w-full p-8 flex flex-col items-center justify-center text-center rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-blue-100/50 dark:border-gray-700/50">
          <Bell className="h-8 w-8 text-blue-500 dark:text-blue-400 mb-2" />
          <h1 className="text-xl font-medium text-gray-700 dark:text-gray-200">
            No notices available
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            You don't have any notifications at this time
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notices.slice(startIndex, endIndex).map((notice, index) => (
            <div
              key={`${notice.user_id}-${index}`}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm border border-blue-100/50 dark:border-gray-700/50 hover:shadow-md transition-all hover:scale-[1.01]"
            >
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-4 py-3">
                <h3 className="font-medium text-white text-lg">
                  {notice.title}
                </h3>
              </div>

              <div className="p-4">
                <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap mb-3">
                  {notice.message}
                </div>

                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2 border-t border-gray-100 dark:border-gray-700/50 pt-2">
                  <Calendar className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                  <span>{formatDate(notice.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination className="flex justify-end p-7">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="cursor-pointer"
              onClick={() => {
                setCurrentPageNo(Math.max(currentPageNo - 1, 1));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>

          {pages
            .slice(
              Math.max(currentPageNo - 2, 0),
              Math.min(currentPageNo + 1, pages.length)
            )
            .map((pageNo) => (
              <PaginationItem key={pageNo}>
                <PaginationLink
                  onClick={() => setCurrentPageNo(pageNo)}
                  isActive={pageNo === currentPageNo}
                  className="cursor-pointer"
                >
                  {pageNo}
                </PaginationLink>
              </PaginationItem>
            ))}

          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className="cursor-pointer"
              onClick={() => {
                setCurrentPageNo(Math.min(currentPageNo + 1, pages.length));
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default NoticeSection;
