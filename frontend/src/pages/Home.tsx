import { useUser } from "@clerk/clerk-react";

function Home() {
  const { user } = useUser();

  return (
    <div>
      <h2 className="text-2xl font-bold">Home Page</h2>
      {user ? (
        <p className="mt-4">Welcome, {user.firstName || user.username}!</p>
      ) : (
        <p className="mt-4">Welcome to the home page!</p>
      )}
    </div>
  );
}

export default Home;