import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import TaskForm from './TaskForm';
import { Task, Status, Project } from '../../types';
import { useTaskStore } from '../../store/taskStore';

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  userNames: { [key: string]: string };
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ project, tasks, userNames }) => {
  const { moveTask } = useTaskStore();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Move task to new status
    if (destination.droppableId !== source.droppableId) {
      moveTask(draggableId, destination.droppableId);
    }
  };

  const openTaskModal = (statusId: string) => {
    setSelectedStatus(statusId);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedStatus(null);
  };

  // Group tasks by status
  const tasksByStatus = project.statuses.reduce<Record<string, Task[]>>(
    (acc, status) => {
      acc[status.id] = tasks.filter((task) => task.statusId === status.id);
      return acc;
    },
    {}
  );

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {project.statuses
            .sort((a, b) => a.order - b.order)
            .map((status) => (
              <div
                key={status.id}
                className="flex-shrink-0 w-72 bg-gray-100 rounded-md p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-700">{status.name}</h3>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                    {tasksByStatus[status.id]?.length || 0}
                  </span>
                </div>

                <Droppable droppableId={status.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[200px]"
                    >
                      {tasksByStatus[status.id]?.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                userNames={userNames}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<Plus size={16} />}
                  className="mt-2"
                  onClick={() => openTaskModal(status.id)}
                >
                  Add Task
                </Button>
              </div>
            ))}
        </div>
      </DragDropContext>

      <Modal
        isOpen={isTaskModalOpen}
        onClose={closeTaskModal}
        title="Create New Task"
        size="md"
      >
        <TaskForm
          projectId={project.id}
          statusId={selectedStatus || undefined}
          onSuccess={closeTaskModal}
          onCancel={closeTaskModal}
          userNames={userNames}
        />
      </Modal>
    </>
  );
};

export default KanbanBoard;