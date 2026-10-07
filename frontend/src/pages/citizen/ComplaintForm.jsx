import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { containsVulgarWords } from "@/utils/contentFilter";

import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { createComplaint } from "@/services/complaintService";
import { getCategories } from "@/services/categoryService";
import {
  suggestCategory,
  suggestCategoryFromImage,
  moderateComplaint,
} from "@/services/aiServices";
import { downscaleImage } from "@/lib/imageUtils";

import LocationPicker from "@/components/LocationPicker";

import provinces from "@/data/provinces.json";
import districts from "@/data/districts.json";
import localLevels from "@/data/localLevels.json";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ComplaintForm() {
  const location = useLocation();
  const navigate = useNavigate();

  const department = location.state?.department;

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    tole: "",
  });

  const [suggestion, setSuggestion] = useState(null);

  const [files, setFiles] = useState([]);

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [categoriesError, setCategoriesError] = useState("");

  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loc, setLoc] = useState(null);

  const [availableDistricts, setAvailableDistricts] = useState([]);

  const [availableMunicipalities, setAvailableMunicipalities] = useState([]);

  const [imageSuggestion, setImageSuggestion] = useState(null);

  const [imageAnalyzing, setImageAnalyzing] = useState(false);

  const imageRequestId = useRef(0);

  const imageSourceFile = useRef(null);

  // --------------------------------------------------
  // Load categories for selected department
  // --------------------------------------------------

  useEffect(() => {
    const loadCategories = async () => {
      if (!department?.id) {
        setCategories([]);
        setCategoriesLoading(false);
        return;
      }

      try {
        setCategoriesLoading(true);
        setCategoriesError("");

        const response = await getCategories(department.id);

        const activeCategories = (
          response.categories || []
        ).filter(
          (category) => category.isActive === true
        );

        setCategories(activeCategories);
      } catch (error) {
        console.error(
          "Failed to load categories:",
          error
        );

        setCategoriesError(
          "Failed to load categories. Please try again."
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, [department?.id]);

  // --------------------------------------------------
  // Province -> District
  // --------------------------------------------------

  useEffect(() => {
    if (!formData.province) {
      setAvailableDistricts([]);
      return;
    }

    const filteredDistricts = districts.filter(
      (district) =>
        district.province_code === formData.province
    );

    setAvailableDistricts(filteredDistricts);
  }, [formData.province]);

  // --------------------------------------------------
  // District -> Municipality
  // --------------------------------------------------

  useEffect(() => {
    if (!formData.district) {
      setAvailableMunicipalities([]);
      return;
    }

    const filteredMunicipalities =
      localLevels.filter(
        (localLevel) =>
          localLevel.district_code ===
          formData.district
      );

    setAvailableMunicipalities(
      filteredMunicipalities
    );
  }, [formData.district]);

  // --------------------------------------------------
  // AI category suggestion
  // --------------------------------------------------

  const handleDescriptionBlur = async () => {
    if (
      formData.description.trim().length < 15 ||
      !department?.id
    ) {
      return;
    }

    try {
      const result = await suggestCategory({
        departmentId: department.id,
        text: formData.description,
      });

      console.log("AI result:", result);

      if (
        result?.category &&
        !result.needs_review
      ) {
        setSuggestion(result);
      }
    } catch (error) {
      console.error(
        "AI suggestion failed:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Province change
  // --------------------------------------------------

  const handleProvinceChange = (event) => {
    const provinceCode = event.target.value;

    setFormData((previous) => ({
      ...previous,
      province: provinceCode,
      district: "",
      municipality: "",
      ward: "",
    }));

    setErrors((previous) => ({
      ...previous,
      province: "",
      district: "",
      municipality: "",
      ward: "",
    }));

    setAvailableMunicipalities([]);
  };

  // --------------------------------------------------
  // District change
  // --------------------------------------------------

  const handleDistrictChange = (event) => {
    const districtCode = event.target.value;

    setFormData((previous) => ({
      ...previous,
      district: districtCode,
      municipality: "",
      ward: "",
    }));

    setErrors((previous) => ({
      ...previous,
      district: "",
      municipality: "",
      ward: "",
    }));
  };

  // --------------------------------------------------
  // Municipality change
  // --------------------------------------------------

  const handleMunicipalityChange = (event) => {
    const municipalityName = event.target.value;

    setFormData((previous) => ({
      ...previous,
      municipality: municipalityName,
      ward: "",
    }));

    setErrors((previous) => ({
      ...previous,
      municipality: "",
      ward: "",
    }));
  };

  // --------------------------------------------------
  // Location detected
  // --------------------------------------------------

  const handleLocationDetected = ({
    lat,
    lng,
    address,
    geoAddress,
  }) => {
    console.log(
      "Detected location:",
      geoAddress
    );

    setLoc({
      lat,
      lng,
      address,
      geoAddress,
    });

    const normalize = (value = "") =>
      value
        .toLowerCase()
        .replace(
          /\b(pradesh|province)\b/g,
          ""
        )
        .replace(
          /\b(municipality|metropolitan city|metropolitan|sub-metropolitan city|sub-metropolitan|rural municipality)\b/g,
          ""
        )
        .replace(/\s+/g, " ")
        .trim();

    // -------------------------
    // Province
    // -------------------------

    const detectedProvince = normalize(
      geoAddress.state || ""
    );

    const provinceNameMap = {
      bagamati: "bagmati",
    };

    const normalizedProvince =
      provinceNameMap[detectedProvince] ||
      detectedProvince;

    const province = provinces.find(
      (item) =>
        normalize(item.name_en) ===
        normalizedProvince
    );

    console.log(
      "Detected province:",
      detectedProvince
    );

    console.log(
      "Matched province:",
      province
    );

    if (!province) {
      console.log(
        "Could not match province:",
        detectedProvince
      );

      return;
    }

    // -------------------------
    // District
    // -------------------------

    const detectedDistrict = normalize(
      geoAddress.county ||
        geoAddress.state_district ||
        geoAddress.district ||
        ""
    );

    const district = districts.find(
      (item) =>
        item.province_code === province.code &&
        normalize(item.name_en) ===
          detectedDistrict
    );

    console.log(
      "Detected district:",
      detectedDistrict
    );

    console.log(
      "Matched district:",
      district
    );

    if (!district) {
      console.log(
        "Could not match district:",
        detectedDistrict
      );

      setFormData((previous) => ({
        ...previous,
        province: province.code,
        district: "",
        municipality: "",
        ward: "",
        tole: geoAddress.suburb || "",
      }));

      return;
    }

    // -------------------------
    // Municipality
    // -------------------------

    const detectedMunicipality = normalize(
      geoAddress.municipality ||
        geoAddress.town ||
        geoAddress.city ||
        ""
    );

    const municipality = localLevels.find(
      (item) =>
        item.district_code ===
          district.code &&
        normalize(item.name_en) ===
          detectedMunicipality
    );

    console.log(
      "Detected municipality:",
      detectedMunicipality
    );

    console.log(
      "Matched municipality:",
      municipality
    );

    // -------------------------
    // Ward
    // -------------------------

    let detectedWard = "";

    if (geoAddress.city_district) {
      const wardMatch =
        geoAddress.city_district.match(
          /\d+/
        );

      if (wardMatch) {
        detectedWard = wardMatch[0];
      }
    }

    // -------------------------
    // Tole
    // -------------------------

    const detectedTole =
      geoAddress.suburb ||
      geoAddress.neighbourhood ||
      geoAddress.road ||
      "";

    // -------------------------
    // Fill form
    // -------------------------

    setFormData((previous) => ({
      ...previous,

      province: province.code,

      district: district.code,

      municipality: municipality
        ? municipality.name_en
        : "",

      ward: detectedWard,

      tole: detectedTole,
    }));

    // Clear validation errors

    setErrors((previous) => ({
      ...previous,
      province: "",
      district: "",
      municipality: "",
      ward: "",
    }));
  };

  // --------------------------------------------------
  // Normal input change
  // --------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  // --------------------------------------------------
  // Image analysis
  // --------------------------------------------------

  const analyzeImage = async (file) => {
    if (!department?.id) {
      return;
    }

    const requestId =
      ++imageRequestId.current;

    imageSourceFile.current = file;

    setImageAnalyzing(true);

    setImageSuggestion(null);

    try {
      const smallImage =
        await downscaleImage(file);

      const result =
        await suggestCategoryFromImage({
          departmentId: department.id,
          image: smallImage,
          text: formData.description,
        });

      if (
        requestId !== imageRequestId.current
      ) {
        return;
      }

      if (
        result?.category &&
        !result.needs_review
      ) {
        setImageSuggestion(result);

        setFormData((previous) =>
          previous.category
            ? previous
            : {
                ...previous,
                category:
                  result.category,
              }
        );

        setErrors((previous) => ({
          ...previous,
          category: "",
        }));
      }
    } catch (error) {
      console.error(
        "Image categorization failed:",
        error
      );
    } finally {
      if (
        requestId === imageRequestId.current
      ) {
        setImageAnalyzing(false);
      }
    }
  };

  // --------------------------------------------------
  // File handling
  // --------------------------------------------------

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    const validFiles = [];

    for (const file of selectedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors((previous) => ({
          ...previous,
          files: `${file.name} is larger than 10MB.`,
        }));

        continue;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
      ];

      if (!allowedTypes.includes(file.type)) {
        setErrors((previous) => ({
          ...previous,
          files: `${file.name} is not a supported file type.`,
        }));

        continue;
      }

      validFiles.push(file);
    }

    setFiles((previous) => [
      ...previous,
      ...validFiles,
    ]);

    const firstImage = validFiles.find(
      (file) =>
        [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
        ].includes(file.type)
    );

    if (firstImage) {
      analyzeImage(firstImage);
    }

    if (validFiles.length > 0) {
      setErrors((previous) => ({
        ...previous,
        files: "",
      }));
    }

    event.target.value = "";
  };

  const removeFile = (index) => {
    if (
      imageSourceFile.current === files[index]
    ) {
      imageRequestId.current++;

      imageSourceFile.current = null;

      setImageSuggestion(null);

      setImageAnalyzing(false);
    }

    setFiles((previous) =>
      previous.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
    );
  };

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const validateForm = async () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title =
        "Complaint title is required.";
    }

    if (!formData.category) {
      newErrors.category =
        "Please select a category.";
    }

    if (!formData.description.trim()) {
      newErrors.description =
        "Complaint description is required.";
    }

    if (
      formData.description &&
      containsVulgarWords(
        formData.description
      )
    ) {
      newErrors.description =
        "Please remove vulgar or inappropriate language from the description.";
    }

    if (!formData.province) {
      newErrors.province =
        "Province is required.";
    }

    if (!formData.district) {
      newErrors.district =
        "District is required.";
    }

    if (!formData.municipality) {
      newErrors.municipality =
        "Municipality is required.";
    }

    if (!formData.ward) {
      newErrors.ward =
        "Ward is required.";
    }

    // Stop here if basic validation already found errors

    if (
      Object.keys(newErrors).length > 0
    ) {
      setErrors(newErrors);

      return false;
    }

    // --------------------------------------------------
    // AI moderation
    // --------------------------------------------------

    try {
      const moderationResult =
        await moderateComplaint(
          formData.description
        );

      if (!moderationResult?.allowed) {
        newErrors.description =
          "Please remove vulgar or abusive language from the description.";
      }
    } catch (error) {
      console.error(
        "AI moderation failed:",
        error
      );

      newErrors.description =
        "Unable to verify the description right now. Please try again.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // --------------------------------------------------
  // Submit complaint
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!(await validateForm())) {
      return;
    }

    setIsSubmitting(true);

    setErrors((previous) => ({
      ...previous,
      submit: "",
    }));

    try {
      // Convert selected codes/names into
      // actual English names before sending.

      const selectedProvince =
        provinces.find(
          (province) =>
            province.code ===
            formData.province
        );

      const selectedDistrict =
        districts.find(
          (district) =>
            district.code ===
            formData.district
        );

      const selectedMunicipality =
        localLevels.find(
          (municipality) =>
            municipality.district_code ===
              formData.district &&
            municipality.name_en ===
              formData.municipality
        );

      const result =
        await createComplaint({
          department,

          title: formData.title,

          category: formData.category,

          description:
            formData.description,

          province:
            selectedProvince?.name_en || "",

          district:
            selectedDistrict?.name_en || "",

          municipality:
            selectedMunicipality?.name_en ||
            "",

          ward: formData.ward,

          tole: formData.tole,

          lat: loc?.lat,

          lng: loc?.lng,

          address: loc?.address,

          files,
        });

      navigate("/complaint-submitted", {
        state: {
          complaint: result.complaint,
        },
      });
    } catch (error) {
      console.error(
        "Complaint submission failed:",
        error
      );

      setErrors((previous) => ({
        ...previous,

        submit:
          error.response?.data?.message ||
          error.message ||
          "Failed to submit complaint. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // Department missing
  // --------------------------------------------------

  if (!department) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Department not selected
              </h2>

              <p className="mt-2 text-slate-500">
                Please select a department before
                submitting a complaint.
              </p>

              <Button
                className="mt-6"
                onClick={() =>
                  navigate(
                    "/select-department"
                  )
                }
              >
                Select Department
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-4">
          <div>
            <p className="text-sm font-medium text-blue-600">
              CITIZEN SERVICES
            </p>

            <h1 className="text-xl font-bold text-slate-900">
              Complaint Management System
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Back */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/select-department"
            )
          }
          className="mb-6 flex items-center text-sm text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />

          Change Department
        </button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Submit a Complaint
            </CardTitle>

            <p className="text-sm text-slate-500">
              Department:{" "}
              <span className="font-medium text-slate-700">
                {department.name}
              </span>
            </p>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Title */}

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Complaint Title
                </label>

                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter complaint title"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={
                    handleDescriptionBlur
                  }
                  rows={6}
                  placeholder="Describe the issue in detail"
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Attachments */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Attachments
                </label>

                <label
                  htmlFor="attachments"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
                >
                  <Upload className="mb-3 h-8 w-8 text-slate-400" />

                  <p className="font-medium text-slate-700">
                    Add a photo of the issue
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    We'll detect the category
                    automatically
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP, GIF or PDF ·
                    Maximum 10MB per file
                  </p>

                  <input
                    id="attachments"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                    onChange={
                      handleFileChange
                    }
                    className="hidden"
                  />
                </label>

                {errors.files && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.files}
                  </p>
                )}

                {files.length > 0 && (
                  <div className="mt-5 space-y-4">
                    <p className="text-sm font-semibold text-slate-700">
                      Attachment Preview
                    </p>

                    {files.map(
                      (file, index) => {
                        const previewUrl =
                          URL.createObjectURL(
                            file
                          );

                        const isImage =
                          file.type.startsWith(
                            "image/"
                          );

                        const isPdf =
                          file.type ===
                          "application/pdf";

                        return (
                          <div
                            key={`${file.name}-${index}`}
                            className="overflow-hidden rounded-lg border bg-white"
                          >
                            {isImage && (
                              <div className="flex max-h-80 items-center justify-center bg-slate-100 p-3">
                                <img
                                  src={
                                    previewUrl
                                  }
                                  alt={
                                    file.name
                                  }
                                  className="max-h-72 max-w-full rounded-md object-contain"
                                />
                              </div>
                            )}

                            {isPdf && (
                              <div className="bg-slate-100 p-3">
                                <iframe
                                  src={
                                    previewUrl
                                  }
                                  title={
                                    file.name
                                  }
                                  className="h-80 w-full rounded-md border bg-white"
                                />
                              </div>
                            )}

                            {!isImage &&
                              !isPdf && (
                                <div className="flex items-center gap-3 bg-slate-50 p-5">
                                  <FileText className="h-10 w-10 text-slate-500" />

                                  <div>
                                    <p className="font-medium text-slate-900">
                                      {
                                        file.name
                                      }
                                    </p>

                                    <p className="text-sm text-slate-500">
                                      {
                                        file.type
                                      }
                                    </p>
                                  </div>
                                </div>
                              )}

                            <div className="flex items-center justify-between gap-4 border-t p-4">
                              <div className="flex min-w-0 items-center gap-3">
                                {isImage ? (
                                  <ImageIcon className="h-5 w-5 shrink-0 text-blue-500" />
                                ) : (
                                  <FileText className="h-5 w-5 shrink-0 text-slate-500" />
                                )}

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-900">
                                    {
                                      file.name
                                    }
                                  </p>

                                  <p className="text-xs text-slate-500">
                                    {(
                                      file.size /
                                      1024
                                    ).toFixed(
                                      1
                                    )}{" "}
                                    KB
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeFile(
                                    index
                                  )
                                }
                                className="shrink-0 rounded-md p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                title="Remove file"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Category */}

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Category
                </label>

                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={
                    categoriesLoading ||
                    !!categoriesError
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category._id}
                        value={
                          category.name
                        }
                      >
                        {category.name}
                      </option>
                    )
                  )}
                </select>

                {categoriesError && (
                  <p className="mt-1 text-sm text-red-600">
                    {categoriesError}
                  </p>
                )}

                {!categoriesLoading &&
                  !categoriesError &&
                  categories.length ===
                    0 && (
                    <p className="mt-1 text-sm text-slate-500">
                      No categories are
                      currently available
                      for this department.
                    </p>
                  )}

                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category}
                  </p>
                )}

                {suggestion &&
                  formData.category !==
                    suggestion.category && (
                    <p className="mt-1 text-sm text-blue-600">
                      AI suggests:{" "}
                      <b>
                        {
                          suggestion.category
                        }
                      </b>{" "}
                      <button
                        type="button"
                        className="underline"
                        onClick={() => {
                          setFormData(
                            (previous) => ({
                              ...previous,
                              category:
                                suggestion.category,
                            })
                          );

                          setSuggestion(
                            null
                          );
                        }}
                      >
                        Apply
                      </button>
                    </p>
                  )}

                {imageAnalyzing && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Detecting category from
                    your photo...
                  </p>
                )}

                {imageSuggestion &&
                  !imageAnalyzing &&
                  (formData.category ===
                  imageSuggestion.category ? (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-600">
                      <Sparkles className="h-3.5 w-3.5" />

                      Detected from your
                      photo:{" "}
                      <b>
                        {
                          imageSuggestion.category
                        }
                      </b>

                      <span className="text-slate-400">
                        (you can change it)
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-600">
                      <Sparkles className="h-3.5 w-3.5" />

                      Your photo looks like:{" "}
                      <b>
                        {
                          imageSuggestion.category
                        }
                      </b>

                      <button
                        type="button"
                        className="underline"
                        onClick={() => {
                          setFormData(
                            (previous) => ({
                              ...previous,
                              category:
                                imageSuggestion.category,
                            })
                          );

                          setErrors(
                            (previous) => ({
                              ...previous,
                              category:
                                "",
                            })
                          );
                        }}
                      >
                        Apply
                      </button>
                    </p>
                  ))}
              </div>

              {/* Location */}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Pin exact location on
                  map
                  <span className="ml-1 text-xs font-normal text-slate-400">
                    (Recommended)
                  </span>
                </label>

                <LocationPicker
                  value={loc}
                  onChange={setLoc}
                  onLocationDetected={
                    handleLocationDetected
                  }
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Complaint Location
                </h3>

                {/* Province */}

                <div>
                  <label
                    htmlFor="province"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Province
                  </label>

                  <select
                    id="province"
                    name="province"
                    value={
                      formData.province
                    }
                    onChange={
                      handleProvinceChange
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      Select province
                    </option>

                    {provinces.map(
                      (province) => (
                        <option
                          key={
                            province.code
                          }
                          value={
                            province.code
                          }
                        >
                          {
                            province.name_en
                          }
                        </option>
                      )
                    )}
                  </select>

                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.province}
                    </p>
                  )}
                </div>

                {/* District */}

                <div>
                  <label
                    htmlFor="district"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    District
                  </label>

                  <select
                    id="district"
                    name="district"
                    value={
                      formData.district
                    }
                    onChange={
                      handleDistrictChange
                    }
                    disabled={
                      !formData.province
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {!formData.province
                        ? "Select province first"
                        : "Select district"}
                    </option>

                    {availableDistricts.map(
                      (district) => (
                        <option
                          key={`${district.province_code}-${district.code}`}
                          value={
                            district.code
                          }
                        >
                          {
                            district.name_en
                          }
                        </option>
                      )
                    )}
                  </select>

                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.district}
                    </p>
                  )}
                </div>

                {/* Municipality */}

                <div>
                  <label
                    htmlFor="municipality"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Municipality /
                    Rural Municipality
                  </label>

                  <select
                    id="municipality"
                    name="municipality"
                    value={
                      formData.municipality
                    }
                    onChange={
                      handleMunicipalityChange
                    }
                    disabled={
                      !formData.district
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {!formData.district
                        ? "Select district first"
                        : "Select municipality"}
                    </option>

                    {availableMunicipalities.map(
                      (
                        municipality,
                        index
                      ) => (
                        <option
                          key={`${municipality.district_code}-${municipality.name_en}-${index}`}
                          value={
                            municipality.name_en
                          }
                        >
                          {
                            municipality.name_en
                          }
                        </option>
                      )
                    )}
                  </select>

                  {errors.municipality && (
                    <p className="mt-1 text-sm text-red-600">
                      {
                        errors.municipality
                      }
                    </p>
                  )}
                </div>

                {/* Ward */}

                <div>
                  <label
                    htmlFor="ward"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Ward Number
                  </label>

                  <input
                    id="ward"
                    name="ward"
                    type="number"
                    min="1"
                    max="35"
                    value={
                      formData.ward
                    }
                    onChange={handleChange}
                    disabled={
                      !formData.municipality
                    }
                    placeholder="Enter ward number"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  />

                  {errors.ward && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.ward}
                    </p>
                  )}
                </div>

                {/* Tole */}

                <div>
                  <label
                    htmlFor="tole"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Tole

                    <span className="ml-1 text-xs font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    id="tole"
                    name="tole"
                    value={
                      formData.tole
                    }
                    onChange={handleChange}
                    placeholder="Enter tole / street"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Submit Error */}

              {errors.submit && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errors.submit}
                </div>
              )}

              {/* Submit */}

              <div className="flex justify-end border-t pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Complaint"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default ComplaintForm;