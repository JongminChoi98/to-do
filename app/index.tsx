import { theme } from "@/constants/colors";
import { Feather, Ionicons } from "@expo/vector-icons";
import Fontisto from "@expo/vector-icons/Fontisto";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STORAGE_KEY = "@toDos-mc";

type ToDo = {
  text: string;
  completed: boolean;
};

export default function Index() {
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState<Map<string, ToDo>>(new Map());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const onChangeText = (payload: string) => setText(payload);

  const saveToDos = async (toSave: Map<string, ToDo>) => {
    const objectToSave = Array.from(toSave.entries());
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(objectToSave));
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s !== null) {
      const parsedToDosArray = JSON.parse(s);
      const parsedToDos = new Map<string, ToDo>(parsedToDosArray);
      setToDos(parsedToDos);
    }
  };
  useEffect(() => {
    loadToDos();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    const newToDos = new Map(toDos);
    newToDos.set(Date.now().toString(), { text, completed: false });
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };

  const deleteToDo = (key: string) => {
    Alert.alert("Delete To Do?", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const newToDos = new Map(toDos);
          newToDos.delete(key);
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };

  const toggleComplete = (key: string) => {
    const newToDos = new Map(toDos);
    const toDo = newToDos.get(key);
    if (toDo) {
      toDo.completed = !toDo.completed;
      setToDos(newToDos);
      saveToDos(newToDos);
    }
  };

  const startEditing = (key: string, currentText: string) => {
    setEditingKey(key);
    setEditingText(currentText);
  };

  const editToDo = async (key: string) => {
    const newToDos = new Map(toDos);
    const toDo = newToDos.get(key);
    if (toDo) {
      toDo.text = editingText;
      newToDos.set(key, toDo);
      setToDos(newToDos);
      await saveToDos(newToDos);
      setEditingKey(null);
      setEditingText("");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>To Do</Text>
        </View>
      </View>

      <View>
        <TextInput
          onSubmitEditing={addToDo}
          onChangeText={onChangeText}
          returnKeyType="done"
          value={text}
          placeholder={"Add a To Do"}
          style={styles.input}
        />
      </View>

      <ScrollView>
        {[...toDos.entries()].map(([key, toDo]) => (
          <View style={styles.toDo} key={key}>
            <TouchableOpacity onPress={() => toggleComplete(key)}>
              <Ionicons
                name={toDo.completed ? "checkbox" : "square-outline"}
                size={24}
                color={theme.white}
              />
            </TouchableOpacity>
            {editingKey === key ? (
              <TextInput
                style={styles.editInput}
                value={editingText}
                onChangeText={setEditingText}
                onSubmitEditing={() => editToDo(key)}
                returnKeyType="done"
              />
            ) : (
              <Text
                style={[
                  styles.toDoText,
                  {
                    textDecorationLine: toDo.completed
                      ? "line-through"
                      : "none",
                  },
                ]}
              >
                {toDo.text}
              </Text>
            )}
            <View style={styles.toDoToggleContainer}>
              {editingKey === key ? (
                <TouchableOpacity onPress={() => editToDo(key)}>
                  <Ionicons name="checkmark" size={24} color={theme.white} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => startEditing(key, toDo.text)}>
                  <Feather name="edit" size={18} color={theme.white} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.toDoTrash}
                onPress={() => deleteToDo(key)}
              >
                <Fontisto name="trash" size={18} color={theme.white} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 38,
    fontWeight: "600",
    color: theme.darkPurple,
  },
  input: {
    backgroundColor: theme.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.darkPurple,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    marginLeft: 10,
  },
  toDoToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  toDoTrash: {
    marginLeft: 10,
  },
  editInput: {
    flex: 1,
    backgroundColor: theme.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginLeft: 10,
  },
});
