import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { ActionCard } from "@/components/ui/ActionCard";
import { BrandHero } from "@/components/ui/BrandHero";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeedbackBanner } from "@/components/ui/FeedbackBanner";
import { FormStepHeader } from "@/components/ui/FormStepHeader";
import { InlineActionButton } from "@/components/ui/InlineActionButton";
import { KpiCard } from "@/components/ui/KpiCard";
import { ListRow } from "@/components/ui/ListRow";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Screen } from "@/components/ui/Screen";
import { SectionCard } from "@/components/ui/SectionCard";
import { TextField } from "@/components/ui/TextField";
import { partnerApi } from "@/services/api/partner";
import { useAppStore } from "@/store/useAppStore";
import type { LocalPropertyListing, PropertyLead } from "@/types";

const stepMeta = [
  {
    title: "Basic details",
    subtitle: "Add the property name, place, and type.",
  },
  {
    title: "Photos",
    subtitle: "Add one or more photos for the property.",
  },
  {
    title: "Pricing",
    subtitle: "Set price, units, and contact details.",
  },
  {
    title: "Submit",
    subtitle: "Check everything and save the property listing.",
  },
] as const;

export function PropertyManagementScreen() {
  const propertyDraft = useAppStore((state) => state.propertyDraft);
  const savePropertyDraft = useAppStore((state) => state.savePropertyDraft);
  const clearPropertyDraft = useAppStore((state) => state.clearPropertyDraft);
  const localProperties = useAppStore((state) => state.localProperties);
  const upsertLocalProperty = useAppStore((state) => state.upsertLocalProperty);
  const deleteLocalProperty = useAppStore((state) => state.deleteLocalProperty);
  const archiveLocalProperty = useAppStore((state) => state.archiveLocalProperty);
  const leadStatuses = useAppStore((state) => state.leadStatuses);
  const setLeadStatus = useAppStore((state) => state.setLeadStatus);

  const [leads, setLeads] = useState<PropertyLead[]>([]);
  const [form, setForm] = useState(propertyDraft);
  const [editingPropertyId, setEditingPropertyId] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeProperties = localProperties.filter((item) => item.status !== "archived");

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((current) => {
      const next = {
        ...current,
        [field]: value,
      };
      savePropertyDraft(next);
      return next;
    });
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const loadData = async () => {
    setBusy(true);
    try {
      const liveLeads = await partnerApi.getPropertyLeads();
      setLeads(liveLeads);
    } catch {
      setMessage({ tone: "error", text: "Property leads could not be refreshed right now." });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProperties = useMemo(
    () =>
      activeProperties.filter((item) =>
        `${item.title} ${item.location} ${item.propertyType}`.toLowerCase().includes(filter.trim().toLowerCase())
      ),
    [activeProperties, filter]
  );

  const validateStep = (step: number) => {
    const nextErrors: Record<string, string> = {};

    if (step === 1) {
      if (!form.title.trim()) nextErrors.title = "Property name is required.";
      if (!form.location.trim()) nextErrors.location = "Location is required.";
      if (!form.propertyType.trim()) nextErrors.propertyType = "Property type is required.";
      if (!form.description.trim()) nextErrors.description = "Add a short property description.";
    }

    if (step === 2) {
      if (!form.photoUrls.trim()) nextErrors.photoUrls = "Add at least one property photo.";
    }

    if (step === 3) {
      if (!form.price.trim()) nextErrors.price = "Price is required.";
      if (!form.units.trim()) nextErrors.units = "Units or size is required.";
      if (!form.contactName.trim()) nextErrors.contactName = "Contact name is required.";
      if (!form.contactPhone.trim()) nextErrors.contactPhone = "Contact phone is required.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setEditingPropertyId("");
    setCurrentStep(1);
    setErrors({});
    clearPropertyDraft();
    setForm({
      title: "",
      location: "",
      propertyType: "",
      description: "",
      price: "",
      units: "",
      contactName: "",
      contactPhone: "",
      photoUrls: "",
    });
  };

  const saveDraft = () => {
    savePropertyDraft(form);
    setMessage({ tone: "info", text: "Property draft saved on this device." });
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      updateForm("photoUrls", form.photoUrls ? `${form.photoUrls}, ${result.assets[0].uri}` : result.assets[0].uri);
    }
  };

  const submitProperty = () => {
    if (![1, 2, 3].every((step) => validateStep(step))) {
      setCurrentStep(1);
      setMessage({ tone: "error", text: "Please complete the required property details first." });
      return;
    }

    const now = new Date().toISOString();
    const property: LocalPropertyListing = {
      id: editingPropertyId || `property-${Date.now()}`,
      title: form.title.trim(),
      location: form.location.trim(),
      propertyType: form.propertyType.trim(),
      description: form.description.trim(),
      price: Number(form.price || 0),
      units: Number(form.units || 0),
      contactName: form.contactName.trim(),
      contactPhone: form.contactPhone.trim(),
      photoUrls: form.photoUrls.split(",").map((item) => item.trim()).filter(Boolean),
      status: "active",
      createdAt: editingPropertyId ? localProperties.find((item) => item.id === editingPropertyId)?.createdAt || now : now,
      updatedAt: now,
    };
    upsertLocalProperty(property);
    resetForm();
    setMessage({ tone: "success", text: editingPropertyId ? "Property updated successfully." : "Property saved successfully." });
  };

  const hydrateProperty = (property: LocalPropertyListing) => {
    const nextDraft = {
      title: property.title,
      location: property.location,
      propertyType: property.propertyType,
      description: property.description,
      price: String(property.price),
      units: String(property.units),
      contactName: property.contactName,
      contactPhone: property.contactPhone,
      photoUrls: property.photoUrls.join(", "),
    };
    setEditingPropertyId(property.id);
    setCurrentStep(1);
    setErrors({});
    setForm(nextDraft);
    savePropertyDraft(nextDraft);
    setMessage({ tone: "info", text: "Property details loaded. Update the steps and save again." });
  };

  const currentStepMeta = stepMeta[currentStep - 1];

  return (
    <Screen onRefresh={loadData} refreshing={busy}>
      <BrandHero
        eyebrow="Property management"
        title="Add property and"
        accent="manage leads."
        subtitle="This module is now dedicated to properties, not hotel fallback data."
      >
        <View style={styles.badges}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="home-city-outline" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Local listings</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="users" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Customer leads</Text>
          </View>
          <View style={styles.badge}>
            <Feather name="save" size={16} color="#FDBA74" />
            <Text style={styles.badgeText}>Draft save</Text>
          </View>
        </View>
      </BrandHero>

      {message ? <FeedbackBanner tone={message.tone} message={message.text} /> : null}

      <View className="mt-2 flex-row gap-3">
        <KpiCard label="Properties" value={String(activeProperties.length)} hint="Saved in the app" />
        <KpiCard label="Leads" value={String(leads.length)} hint="Customer interest" />
      </View>
      <View className="flex-row gap-3">
        <KpiCard label="Pending" value={String(leads.filter((lead) => (leadStatuses[lead._id] || "new") === "new").length)} hint="Need follow-up" />
        <KpiCard label="Contacted" value={String(leads.filter((lead) => (leadStatuses[lead._id] || "new") === "contacted").length)} hint="In progress" />
      </View>

      <SectionCard title="Add property" subtitle="Move step by step and save when you are ready.">
        <FormStepHeader currentStep={currentStep} totalSteps={4} title={currentStepMeta.title} subtitle={currentStepMeta.subtitle} />

        {currentStep === 1 ? (
          <>
            <TextField label="Property name" value={form.title} onChangeText={(value) => updateForm("title", value)} placeholder="Hillside Homestay" required error={errors.title} />
            <TextField label="Location" value={form.location} onChangeText={(value) => updateForm("location", value)} placeholder="Ranikhet, Uttarakhand" required error={errors.location} />
            <TextField label="Property type" value={form.propertyType} onChangeText={(value) => updateForm("propertyType", value)} placeholder="Homestay, Land, Cottage" required error={errors.propertyType} />
            <TextField label="Description" value={form.description} onChangeText={(value) => updateForm("description", value)} placeholder="Quiet stay with mountain views" multiline required error={errors.description} />
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <TextField label="Photos" value={form.photoUrls} onChangeText={(value) => updateForm("photoUrls", value)} placeholder="Paste image links or pick a photo" multiline autoCapitalize="none" required error={errors.photoUrls} />
            <View className="mb-4 flex-row flex-wrap gap-2">
              <InlineActionButton title="Pick photo" tone="primary" onPress={pickPhoto} disabled={busy} />
              <InlineActionButton title="Save draft" onPress={saveDraft} disabled={busy} />
            </View>
            {form.photoUrls ? (
              <View className="rounded-3xl border border-white/10 bg-white/5 p-3">
                <Text className="mb-3 text-xs font-black uppercase tracking-[2px] text-white/60">Photo preview</Text>
                <Image source={{ uri: form.photoUrls.split(",")[0].trim() }} style={{ height: 180, borderRadius: 18 }} resizeMode="cover" />
              </View>
            ) : (
              <EmptyState title="No photo yet" message="Add a property photo to make the listing more trustworthy." icon="image" />
            )}
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <TextField label="Price" value={form.price} onChangeText={(value) => updateForm("price", value)} placeholder="6500" keyboardType="numeric" autoCapitalize="none" required error={errors.price} />
            <TextField label="Units or size" value={form.units} onChangeText={(value) => updateForm("units", value)} placeholder="3" keyboardType="numeric" autoCapitalize="none" required error={errors.units} helperText="Use rooms, cottages, or plot size count." />
            <TextField label="Contact name" value={form.contactName} onChangeText={(value) => updateForm("contactName", value)} placeholder="Amit Rawat" required error={errors.contactName} />
            <TextField label="Contact phone" value={form.contactPhone} onChangeText={(value) => updateForm("contactPhone", value)} placeholder="+91 98..." required error={errors.contactPhone} keyboardType="phone-pad" autoCapitalize="none" />
          </>
        ) : null}

        {currentStep === 4 ? (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{form.title || "New property listing"}</Text>
            <Text style={styles.summaryLine}>Location: {form.location || "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Type: {form.propertyType || "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Price: {form.price ? `Rs ${form.price}` : "Not added yet"}</Text>
            <Text style={styles.summaryLine}>Contact: {form.contactName || "Not added yet"}</Text>
            <Text style={styles.summaryHint}>This property is saved in the app until dedicated backend property APIs are ready.</Text>
          </View>
        ) : null}

        <View style={styles.footerRow}>
          {currentStep > 1 ? <PrimaryButton title="Back" onPress={() => setCurrentStep((step) => step - 1)} variant="ghost" /> : null}
          {currentStep < 4 ? (
            <PrimaryButton
              title="Next"
              onPress={() => {
                if (validateStep(currentStep)) {
                  setCurrentStep((step) => step + 1);
                }
              }}
            />
          ) : (
            <PrimaryButton title={editingPropertyId ? "Update property" : "Save property"} onPress={submitProperty} loading={busy} />
          )}
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <InlineActionButton title="Save draft" onPress={saveDraft} disabled={busy} />
          <InlineActionButton title="Clear form" onPress={resetForm} disabled={busy} />
        </View>
      </SectionCard>

      <SectionCard title="Property list" subtitle="Search, edit, archive, or remove property listings.">
        <TextField label="Search" value={filter} onChangeText={setFilter} placeholder="Search by name, type, or area" />
        {filteredProperties.length ? (
          filteredProperties.map((property) => (
            <ActionCard
              key={property.id}
              title={property.title}
              detail={`${property.location} | ${property.propertyType} | Rs ${property.price} | ${property.units} units`}
              status={property.status}
            >
              <View className="flex-row flex-wrap gap-2">
                <InlineActionButton title="Edit" onPress={() => hydrateProperty(property)} />
                <InlineActionButton title="Archive" onPress={() => archiveLocalProperty(property.id)} />
                <InlineActionButton title="Delete" tone="danger" onPress={() => deleteLocalProperty(property.id)} />
              </View>
            </ActionCard>
          ))
        ) : (
          <EmptyState title="No properties found" message="Add your first property above or change the search text." icon="layout" />
        )}
      </SectionCard>

      <SectionCard title="Customer leads" subtitle="See interested customers and track follow-up status.">
        {leads.length ? (
          leads.map((lead) => {
            const leadStatus = leadStatuses[lead._id] || "new";
            return (
              <ActionCard
                key={lead._id}
                title={lead.title}
                detail={`${lead.customerName}${lead.location ? ` | ${lead.location}` : ""}${lead.budget ? ` | Budget Rs ${lead.budget}` : ""}${lead.message ? ` | ${lead.message}` : ""}`}
                status={leadStatus}
              >
                <View className="flex-row flex-wrap gap-2">
                  <InlineActionButton title="New" onPress={() => setLeadStatus(lead._id, "new")} />
                  <InlineActionButton title="Contacted" tone="primary" onPress={() => setLeadStatus(lead._id, "contacted")} />
                  <InlineActionButton title="Closed" onPress={() => setLeadStatus(lead._id, "closed")} />
                </View>
              </ActionCard>
            );
          })
        ) : (
          <EmptyState title="No leads yet" message="Customer leads will appear here when the backend sends them." icon="users" />
        )}
      </SectionCard>

      <SectionCard title="Inquiry management" subtitle="Track which leads need a reply first.">
        {leads.length ? (
          leads.map((lead) => (
            <ListRow
              key={`inquiry-${lead._id}`}
              title={lead.customerName}
              meta={`${lead.title}${lead.message ? ` | ${lead.message}` : ""}`}
              status={leadStatuses[lead._id] || "new"}
            />
          ))
        ) : (
          <EmptyState title="No inquiries yet" message="Inquiry tracking will start when customer leads arrive." icon="message-square" />
        )}
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
  footerRow: {
    marginTop: 4,
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  summaryLine: {
    marginTop: 8,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryHint: {
    marginTop: 12,
    color: "#FDBA74",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
