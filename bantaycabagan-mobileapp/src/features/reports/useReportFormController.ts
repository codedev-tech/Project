import { requestErrorMessage } from '../../utils/requestFeedback';
import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { isCabaganBarangay } from '../../constants/cabaganBarangays';
import { isInsideCabagan } from '../../constants/cabaganGeofence';
import type {
  DeploymentAssignment,
  LivePersonnel,
  PoliceReport,
  ReportEvidenceInput,
  SubmitReportInput,
} from '../../types/operations';
import { discardTemporaryEvidence } from '../../services/offlineReportQueue';
import { selectPersonnelDeployment } from '../operations/operationalState';
import type { editPoliceReport } from '../../services/operationsApi';
import {
  createEmptyReportForm,
  getBarangayFromArea,
  type ReportForm,
} from './reportForm';

type SheetClose = (afterClose?: () => void) => void;

type Options = {
  currentPersonnelId: string;
  deployments: DeploymentAssignment[];
  personnel: LivePersonnel[];
  resolveReport: (reportId: string, resolutionNotes: string) => Promise<void>;
  submitReport: (input: SubmitReportInput) => Promise<'submitted' | 'queued'>;
  editReport?: (reportId: string, input: Parameters<typeof editPoliceReport>[1]) => Promise<PoliceReport>;
};

export function useReportFormController({
  currentPersonnelId,
  deployments,
  personnel,
  resolveReport,
  submitReport,
  editReport,
}: Options) {
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState(createEmptyReportForm);
  const [barangayPickerVisible, setBarangayPickerVisible] = useState(false);
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<PoliceReport | null>(null);
  const [editReason, setEditReason] = useState('');
  const savingRef = useRef(false);
  const [resolveTarget, setResolveTarget] = useState<PoliceReport | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [evidencePhoto, setEvidencePhoto] = useState<ReportEvidenceInput | null>(null);

  const openSubmitForm = () => {
    setEditTarget(null);
    setEditReason('');
    const assignedArea = selectPersonnelDeployment(deployments, currentPersonnelId)?.patrolArea || '';
    setForm({
      ...createEmptyReportForm(),
      occurred_at: new Date().toISOString(),
      assigned_area: assignedArea,
      barangay: getBarangayFromArea(assignedArea),
    });
    setEvidencePhoto(null);
    setFormVisible(true);
  };

  const openEditForm = (report: PoliceReport) => {
    setEditTarget(report);
    setEditReason('');
    setEvidencePhoto(null);
    setForm({ report_type: report.report_type, title: report.title, description: report.description,
      location: report.location, barangay: report.barangay, severity: report.severity,
      occurred_at: report.occurred_at, assigned_area: report.assigned_area,
      location_source: report.location_source || 'manual',
      latitude: report.latitude ?? undefined, longitude: report.longitude ?? undefined });
    setFormVisible(true);
  };

  const captureEvidencePhoto = async (cameraFacing: 'front' | 'back') => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera permission required',
          'Allow camera access in your phone settings to capture report evidence.',
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        cameraType: cameraFacing === 'front'
          ? ImagePicker.CameraType.front
          : ImagePicker.CameraType.back,
        quality: 0.72,
        allowsEditing: false,
        exif: false,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const mimeType = asset.mimeType || 'image/jpeg';
      const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
      const previousEvidenceUri = evidencePhoto?.uri;
      setEvidencePhoto({
        uri: asset.uri,
        name: asset.fileName || `report-evidence-${Date.now()}.${extension}`,
        type: mimeType,
        camera_facing: cameraFacing,
        captured_at: new Date().toISOString(),
      });
      if (previousEvidenceUri && previousEvidenceUri !== asset.uri) {
        discardTemporaryEvidence(previousEvidenceUri).catch(() => undefined);
      }
    } catch {
      Alert.alert('Camera unavailable', 'Could not open the camera or capture the photo. Close other camera apps, check camera permission, and try again.');
    }
  };

  const chooseEvidenceCamera = () => {
    Alert.alert(
      evidencePhoto ? 'Retake photo evidence' : 'Capture photo evidence',
      'Choose which camera to use.',
      [
        { text: 'Back camera', onPress: () => captureEvidencePhoto('back') },
        { text: 'Front camera', onPress: () => captureEvidencePhoto('front') },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const updateForm = <Field extends keyof ReportForm>(field: Field, value: ReportForm[Field]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const selectBarangay = (barangay: string) => {
    setForm((current) => ({
      ...current,
      barangay,
    }));
  };

  const updateManualLocation = (location: string) => {
    setForm((current) => ({
      ...current,
      location,
      location_source: 'manual',
    }));
  };

  const usePinnedLocation = (coordinates: { latitude: number; longitude: number }) => {
    setForm((current) => ({
      ...current,
      location_source: 'manual',
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    }));
    setLocationPickerVisible(false);
  };

  const useCurrentGpsSuggestion = () => {
    const liveOfficer = personnel.find((member) => member.id === currentPersonnelId);
    const latitude = liveOfficer?.latitude;
    const longitude = liveOfficer?.longitude;
    const readingAge = Date.now() - new Date(liveOfficer?.locationRecordedAt || '').getTime();
    const staleAfter = (liveOfficer?.locationStaleAfterSeconds || 120) * 1000;
    const hasCurrentCoordinates = liveOfficer?.locationStatus === 'current'
      && liveOfficer.isLocationStale !== true
      && Number.isFinite(readingAge) && readingAge >= -300_000 && readingAge <= staleAfter
      && typeof latitude === 'number'
      && Number.isFinite(latitude)
      && typeof longitude === 'number'
      && Number.isFinite(longitude);
    if (!liveOfficer || !hasCurrentCoordinates) {
      Alert.alert(
        'GPS unavailable',
        'You can still submit the report manually. Select the Cabagan barangay and enter the exact incident place.',
      );
      return;
    }
    if (!isInsideCabagan(latitude!, longitude!)) {
      Alert.alert(
        'Current GPS is outside Cabagan',
        'The current position cannot be used as the incident barangay. Select the actual Cabagan barangay and enter the place manually.',
      );
      return;
    }
    const detectedBarangay = getBarangayFromArea(liveOfficer.locationName);
    setForm((current) => ({
      ...current,
      barangay: detectedBarangay,
      location: liveOfficer.locationName,
      location_source: 'gps',
      latitude,
      longitude,
    }));
    if (!detectedBarangay) {
      setBarangayPickerVisible(true);
      Alert.alert('Select the incident barangay', 'GPS coordinates were added. The barangay could not be identified; select it and check the exact place or landmark.');
    }
  };

  const handleSubmit = async (close: SheetClose) => {
    if (savingRef.current) return;
    if (
      !form.title.trim()
      || !form.description.trim()
      || !form.location.trim()
      || !isCabaganBarangay(form.barangay)
    ) {
      Alert.alert('Complete the report', 'Title, description, location, and barangay are required.');
      return;
    }
    if (!Number.isFinite(new Date(form.occurred_at).getTime()) || new Date(form.occurred_at).getTime() > Date.now() + 300000) {
      Alert.alert('Check the date and time', 'Enter a valid incident/activity date and time that is not in the future.');
      return;
    }
    if (editTarget && !editReason.trim()) {
      Alert.alert('Correction reason required', 'Explain what needs to be corrected.');
      return;
    }
    savingRef.current = true;
    setIsSaving(true);
    try {
      if (editTarget) {
        if (!editReport) throw new Error('Report corrections are unavailable. Reopen the app and try again.');
        const { assigned_area: _area, evidence_photo: _evidence, ...content } = form;
        await editReport(editTarget.id, { ...content,
          latitude: form.latitude ?? null, longitude: form.longitude ?? null,
          reason: editReason.trim(), revision: editTarget.revision || 0 });
        close(() => Alert.alert('Correction submitted', 'Your changes were recorded in the report history. The report is pending review.'));
        return;
      }
      const result = await submitReport({
        ...form,
        ...(evidencePhoto && { evidence_photo: evidencePhoto }),
      });
      await discardTemporaryEvidence(evidencePhoto?.uri).catch(() => undefined);
      setEvidencePhoto(null);
      setForm(createEmptyReportForm());
      close(() => Alert.alert(
        result === 'queued' ? 'Report saved offline' : 'Report submitted',
        result === 'queued'
          ? 'The report and its evidence are secured on this device and will synchronize automatically.'
          : form.report_type === 'incident'
            ? 'The incident is open and can now be resolved from Report History.'
            : 'The activity report was saved to your history.',
      ));
    } catch (error) {
      Alert.alert('Report submission needs attention', requestErrorMessage(error, { action: 'submit the report', write: true }));
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const handleResolve = async (close: SheetClose) => {
    if (!resolveTarget || !resolutionNotes.trim()) {
      Alert.alert('Resolution notes required', 'Describe the action taken before resolving the incident.');
      return;
    }
    setIsSaving(true);
    try {
      await resolveReport(resolveTarget.id, resolutionNotes.trim());
      close(() => {
        setResolutionNotes('');
        Alert.alert('Incident resolved', 'Web Reports and Analytics were updated automatically.');
      });
    } catch (error) {
      Alert.alert('Unable to resolve incident', requestErrorMessage(error, { action: 'resolve the incident', write: true }));
    } finally {
      setIsSaving(false);
    }
  };

  return {
    barangayPickerVisible,
    chooseEvidenceCamera,
    evidencePhoto,
    form,
    formVisible,
    handleResolve,
    handleSubmit,
    isSaving,
    locationPickerVisible,
    openSubmitForm,
    resolutionNotes,
    resolveTarget,
    selectBarangay,
    editTarget, editReason, setEditReason, openEditForm,
    setBarangayPickerVisible,
    setEvidencePhoto,
    setFormVisible,
    setLocationPickerVisible,
    setResolutionNotes,
    setResolveTarget,
    updateForm,
    updateManualLocation,
    useCurrentGpsSuggestion,
    usePinnedLocation,
  };
}
