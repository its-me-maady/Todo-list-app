import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTasks } from '../hooks/useTasks';
import { useFilter } from '../hooks/useFilter';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import FilterBar from '../components/FilterBar';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';
import { Task } from '../utils/taskUtils';

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashLogo}>⚡</Text>
      <Text style={styles.splashTitle}>TaskFlow</Text>
      <Text style={styles.splashTagline}>Stay in the flow.</Text>
    </View>
  );
}

function Header({ total, done, user, isLoggedIn, onLogin, onLogout }: any) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <View style={styles.headerLogo}>
          <Text style={styles.headerLogoIcon}>⚡</Text>
          <Text style={styles.headerTitle}>TaskFlow</Text>
        </View>
        
        {isLoggedIn ? (
          <View style={styles.authContainer}>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
            <Pressable onPress={onLogout} style={styles.authBtn}>
              <Text style={styles.authBtnText}>Logout</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={onLogin} style={styles.authBtn}>
            <Text style={styles.authBtnText}>Login for Cloud</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.headerStats}>
          {done}/{total} done
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [splash, setSplash] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const router = useRouter();
  const { isLoggedIn, user, logout } = useAuth();
  const { isLoaded, tasks, addTask, updateTask, deleteTask, toggleTask } = useTasks();

  const {
    activePriority,
    activeLabel,
    availableLabels,
    isFiltered,
    filteredTasks,
    togglePriority,
    toggleLabel,
    clearFilters,
  } = useFilter(tasks);

  useEffect(() => {
    // Show splash for 1.4s or until loaded, whichever is longer
    const timer = setTimeout(() => {
      if (isLoaded) {
        setSplash(false);
      }
    }, 1400);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  useEffect(() => {
    // Also wait for isLoaded if the 1.4s has already passed
    if (isLoaded && !splash) {
      // Just confirming it's loaded before rendering
    }
  }, [isLoaded, splash]);

  if (splash || !isLoaded) {
    return <SplashScreen />;
  }

  const openAdd = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  const handleSave = (formData: any) => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteTask(id);
  };

  const totalCount = tasks.length;
  const doneCount = tasks.filter(t => t.isCompleted).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Header 
        total={totalCount} 
        done={doneCount} 
        user={user}
        isLoggedIn={isLoggedIn}
        onLogin={() => router.push('/login')}
        onLogout={logout}
      />

      <FilterBar
        activePriority={activePriority}
        activeLabel={activeLabel}
        availableLabels={availableLabels}
        isFiltered={isFiltered}
        onTogglePriority={togglePriority}
        onToggleLabel={toggleLabel}
        onClear={clearFilters}
      />

      <TaskList
        tasks={filteredTasks}
        allCount={totalCount}
        isFiltered={isFiltered}
        onToggle={toggleTask}
        onEdit={openEdit}
        onAddFirst={openAdd}
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={openAdd}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>

      <TaskModal
        isOpen={modalOpen}
        task={editingTask}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    fontSize: 64,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  splashTagline: {
    fontSize: 16,
    color: '#aaa',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerStats: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statsRow: {
    marginTop: 8,
  },
  authContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    maxWidth: 100,
  },
  authBtn: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  authBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
    lineHeight: 34,
  },
});
