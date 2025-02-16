"use client";
import { useEffect, useState, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { deassignroomid_user } from "../../../../supabaseClient";
import { useRoomID } from "../../../../RoomIDContext";
import { fetchUserbyRoomID } from "../../../../supabaseClient";
import { fetchroomowner } from "../../../../supabaseClient";
import OCR from "../../../../components/OCR";
import { createClient } from "@supabase/supabase-js";
// Initialize the Supabase client with your Supabase URL and API key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export default function Room({ params }) {
  const { roomID, setRoomID } = useRoomID();

  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const room = params.selectroom;
  // Adding roomid to user in supabase

  const [database, setDatabase] = useState([]);

  const [roomCode, setRoomCode] = useState("");

  // async function fetchroomdata() {
  //   console.log("laskfdlkaskd", roomID, "database", database);
  //   if (roomID !== null) {
  //     let supabaseData = await axios.post("/api/fetchRoomById", roomID);
  //     let OwnwerData = await axios.post("/api/fetchRoomOwnerById", roomID);
  //     console.log(supabaseData);
  //     if (supabaseData) {
  //       setDatabase(supabaseData.data);
  //       // console.log(supabaseData.data.length);
  //     }
  //     const db = supabaseData.data;
  //     // if (OwnwerData.data.length !== 0) {
  //     //   const ownerdb = OwnwerData.data[0]["owner_name"];
  //     //   const possible = db.find((obj) => obj.name === ownerdb);
  //     //   if (possible) {
  //     //     getRoomCode();
  //     //   } else {
  //     //     setRoomCode(undefined);
  //     //   }
  //     // }
  //     // getRoomCode();
  //   }
  // }
  // useEffect(() => {
  //   console.log(roomCode);
  // }, [roomCode]);

  useEffect(() => {
    getRoomCode();
  }, []);

  useEffect(() => {
    const fetchroomdata = async () => {
      if (user) {
        try {
          if (roomID) {
            const roomId = {
              id: roomID,
            };
            let usersInRoom = await axios.post("/api/fetchRoomById", roomId);
            setDatabase(usersInRoom.data);

            // console.log("fetchRoomsById", supabaseData.data);
          }
        } catch (error) {
          console.log("fetchroom error");
        }
      }
    };

    if (user && roomID) {
      fetchroomdata();
    }
  }, [user, roomID]);

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (user) {
        try {
          if (roomID) {
            const roomId = {
              id: roomID,
            };

            let OwnwerData = await axios.post(
              "/api/fetchRoomOwnerById",
              roomId
            );
            console.log("owner of the room", OwnwerData.data);
          }
        } catch (error) {
          console.log("owner info error");
        }
      }
    };

    fetchOwnerData();
  }, []);

  useEffect(() => {
    const User = supabase
      .channel("custom-update-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "User" },
        (payload) => {
          // console.log('Change received!', payload)
          fetchroomdata();
        }
      )
      .subscribe();
  }, []);

  function goBack(userid) {
    router.back();
    const deassignuser = async (userid) => {
      try {
        if (user) {
          // Create the user in Supabase with their user ID
          await deassignroomid_user(userid);
          console.log("User updated with room");
        }
      } catch (error) {
        console.error("Error creating Room in Supabase:", error);
      }
    };

    // Call the createUser function when the user is authenticated
    if (user) {
      deassignuser(userid);
    }
  }

  const getRoomCode = async () => {
    console.log("getting room code");
    try {
      const response = await axios.get("/api/roomCode");
      setRoomCode(response.data.code);
      console.log("Success!", response.data.code);
    } catch (error) {
      console.log("failed!!!!", error.message);
    }
  };

  const handleCopy = (copyReferelId) => {
    setCopied(copyReferelId);

    navigator.clipboard.writeText(copyReferelId);
    alert("Room Code copied to your clipboard!");
  };

  return (
    <div className="flex flex-col justify-center items-center">
      {/* {console.log(database)} */}
      <div className="flex justify-start items-center w-11/12 md:w-1/2">
        <button
          onClick={() => goBack(user?.id)}
          className=" bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
        >
          Go Back
        </button>
      </div>
      {/* <div className="flex flex-col md:flex-row justify-center items-center w-11/12 md:w-1/2 my-4 md:my-12">
        <p className="text-2xl">Waiting Room For </p>{" "}
        <span className="text-red-400 font-bold text-2xl mx-1">
          {" "}
          {database && database[room]} :
        </span>
      </div> */}
      <div className="flex flex-col justify-center items-center w-11/12 md:w-1/2 my-4">
        <h3 className="text-2xl font-semibold mb-2">Players in the room:</h3>
        {/* {console.log("database", database)} */}
        {database &&
          database.map((item, index) => (
            <div key={index} className="mb-1">
              {/* {checkUserInSupabase(item["user_id"]).name} */}
              {item["name"]}
            </div>
          ))}
      </div>
      <div className="flex flex-col justify-center items-center w-11/12 md:w-1/2">
        <p>Your room code is : </p>{" "}
        <div className="my-3 text-center text-sm md:text-lg md:my-4 flex justify-center items-center px-4 md:px-12">
          {roomCode ? (
            <p className="bg-gray-100 py-3 px-8 border rounded-l-lg">
              {roomCode}{" "}
            </p>
          ) : (
            <p className="bg-gray-100 h-11 md:h-14 w-32 border rounded-l-lg">
              {" "}
            </p>
          )}
          <button
            onClick={() => handleCopy(roomCode)}
            className="bg-blue-500 text-white px-4 py-3 rounded-r-lg "
          >
            Copy
          </button>
        </div>
      </div>
      {/* {roomCode !== undefined ? ( */}
      <OCR roomCode={roomCode} roomId={roomID} userId={user.id} />
      {/* ) : (
        <div>Loading</div>
      )} */}
    </div>
  );
}
