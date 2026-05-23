import { Badge } from "@/components/ui/badge";
import getStatusColor from "../utils/getStatusColor";
import { Todo } from "@ems-portal/types";

interface TodoInfoProps {
  description: string;
  createdAt: Date;
  status: Todo["status"];
}

const TodoInfo = ({ description, createdAt, status }: TodoInfoProps) => {
  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

  return (
    <>
      {/* Description Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">
          Description
        </h3>
        <p className="text-base text-gray-900">{description}</p>
      </div>

      {/* Dates Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Created Date
          </h3>
          <p className="text-base text-gray-900">{formatDate(createdAt)}</p>
        </div>
      </div>

      {/* Status Section */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Status</h3>
        <Badge className={getStatusColor(status)}>{status}</Badge>
      </div>
    </>
  );
};

export default TodoInfo;
