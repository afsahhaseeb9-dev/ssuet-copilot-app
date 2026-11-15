import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

export default function RequestRoleScreen() {
  const { profile } = useAuth();
  const [requestedRole, setRequestedRole] = useState('student');

  // Student fields
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('');

  // Teacher fields
  const [designation, setDesignation] = useState('');
  const [teacherDepartment, setTeacherDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setErrorMsg('');
    setSuccessMsg('');

    let submittedInfo = {};

    if (requestedRole === 'student') {
      if (!studentId || !department || !batch) {
        setErrorMsg('Please fill in all student fields.');
        return;
      }
      submittedInfo = { student_id: studentId, department, batch };
    } else {
      if (!designation || !teacherDepartment) {
        setErrorMsg('Please fill in all teacher fields.');
        return;
      }
      submittedInfo = {
        designation,
        department: teacherDepartment,
        employee_id: employeeId || null,
      };
    }

    setLoading(true);
    const { error } = await supabase.from('role_requests').insert({
      requester_id: profile.id,
      requested_role: requestedRole,
      submitted_info: submittedInfo,
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message || 'Something went wrong. Please try again.');
      return;
    }

    setSuccessMsg('Your request has been submitted. An admin will review it soon.');
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Request a Role
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Let us know if you're an SSUET student or faculty member
      </Text>

      <SegmentedButtons
        value={requestedRole}
        onValueChange={setRequestedRole}
        buttons={[
          { value: 'student', label: 'Student' },
          { value: 'teacher', label: 'Teacher' },
        ]}
        style={styles.segmented}
      />

      {requestedRole === 'student' ? (
        <>
          <TextInput
            label="Student ID / Roll Number"
            value={studentId}
            onChangeText={setStudentId}
            style={styles.input}
          />
          <TextInput
            label="Department"
            value={department}
            onChangeText={setDepartment}
            style={styles.input}
          />
          <TextInput
            label="Batch / Year (e.g. 2021)"
            value={batch}
            onChangeText={setBatch}
            style={styles.input}
          />
        </>
      ) : (
        <>
          <TextInput
            label="Designation (e.g. Assistant Professor)"
            value={designation}
            onChangeText={setDesignation}
            style={styles.input}
          />
          <TextInput
            label="Department"
            value={teacherDepartment}
            onChangeText={setTeacherDepartment}
            style={styles.input}
          />
          <TextInput
            label="Employee ID (optional)"
            value={employeeId}
            onChangeText={setEmployeeId}
            style={styles.input}
          />
        </>
      )}

      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}
      {successMsg ? <Text style={styles.success}>{successMsg}</Text> : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading || !!successMsg}
        style={styles.button}>
        Submit Request
      </Button>

      <Button mode="text" onPress={() => router.back()} style={styles.link}>
        Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  segmented: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  error: {
    color: '#B3261E',
    marginBottom: 12,
    textAlign: 'center',
  },
  success: {
    color: '#4CAF50',
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  link: {
    marginTop: 8,
  },
});