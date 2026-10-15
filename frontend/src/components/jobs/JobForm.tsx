import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CreateJobInput, Job } from "../../types";
import { Input } from "../common/Input";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { X, Plus } from "lucide-react";

const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000),
  salary: z.coerce.number().min(1, "Salary must be greater than 0"),
  location: z.string().min(2, "Location is required"),
  jobType: z.enum(["full-time", "part-time", "internship", "contract"], {
    errorMap: () => ({ message: "Please select a valid job type" }),
  }),
  experienceLevel: z.enum(["fresher", "1-3 years", "3-5 years", "5+ years"], {
    errorMap: () => ({ message: "Please select an experience level" }),
  }),
  position: z.coerce.number().min(1, "At least 1 position is required"),
});

type JobFormValues = z.infer<typeof jobSchema>;

interface JobFormProps {
  initialData?: Job;
  onSubmit: (data: CreateJobInput) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = "Save Job",
}) => {
  const [requirementsList, setRequirementsList] = useState<string[]>(
    initialData?.requirements || ["React", "JavaScript"]
  );
  const [reqInput, setReqInput] = useState("");
  const [reqError, setReqError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      salary: initialData?.salary || 800000,
      location: initialData?.location || "",
      jobType: initialData?.jobType || "full-time",
      experienceLevel: initialData?.experienceLevel || "fresher",
      position: initialData?.position || 1,
    },
  });

  const handleAddRequirement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = reqInput.trim();
    if (!trimmed) return;
    if (requirementsList.includes(trimmed)) {
      setReqError("Requirement already added");
      return;
    }
    setRequirementsList([...requirementsList, trimmed]);
    setReqInput("");
    setReqError("");
  };

  const handleRemoveRequirement = (index: number) => {
    setRequirementsList(requirementsList.filter((_, i) => i !== index));
  };

  const onFormSubmit = async (data: JobFormValues) => {
    if (requirementsList.length === 0) {
      setReqError("Please add at least one requirement or skill tag");
      return;
    }

    await onSubmit({
      ...data,
      requirements: requirementsList,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Frontend Engineer"
            error={errors.title?.message}
            {...register("title")}
          />
        </div>

        <Select
          label="Job Type"
          options={[
            { label: "Full Time", value: "full-time" },
            { label: "Part Time", value: "part-time" },
            { label: "Internship", value: "internship" },
            { label: "Contract", value: "contract" },
          ]}
          error={errors.jobType?.message}
          {...register("jobType")}
        />

        <Select
          label="Experience Level"
          options={[
            { label: "Fresher", value: "fresher" },
            { label: "1-3 Years", value: "1-3 years" },
            { label: "3-5 Years", value: "3-5 years" },
            { label: "5+ Years", value: "5+ years" },
          ]}
          error={errors.experienceLevel?.message}
          {...register("experienceLevel")}
        />

        <Input
          label="Location"
          placeholder="e.g. Bangalore / Remote"
          error={errors.location?.message}
          {...register("location")}
        />

        <Input
          label="Annual Salary (INR)"
          type="number"
          placeholder="e.g. 1200000"
          error={errors.salary?.message}
          {...register("salary")}
        />

        <div className="md:col-span-2">
          <Input
            label="Number of Open Positions"
            type="number"
            min={1}
            error={errors.position?.message}
            {...register("position")}
          />
        </div>

        {/* Requirements Tag Input */}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 block mb-1.5">
            Key Requirements & Skills
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type skill & press Enter (e.g. TypeScript, Docker)"
              value={reqInput}
              onChange={(e) => {
                setReqInput(e.target.value);
                setReqError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddRequirement();
                }
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddRequirement}
              icon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>
          {reqError && (
            <p className="mt-1 text-xs text-rose-500 font-medium">{reqError}</p>
          )}

          {/* Tag List */}
          <div className="mt-3 flex flex-wrap gap-2 min-h-8">
            {requirementsList.map((req, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800"
              >
                {req}
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(index)}
                  className="hover:text-rose-600 dark:hover:text-rose-400 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Description textarea */}
        <div className="md:col-span-2">
          <label className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 block mb-1.5">
            Detailed Job Description
          </label>
          <textarea
            rows={5}
            placeholder="Describe role responsibilities, perks, expectations..."
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            {...register("description")}
          />
          {errors.description?.message && (
            <p className="mt-1 text-xs text-rose-500 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
        <Button type="submit" isLoading={isLoading} size="lg">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
