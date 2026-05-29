import { useRouter } from "next/navigation";

export const handleOAuthCallback = async (provider, code) => {
  setLoading(true);
  const router = useRouter()

  try {
    const res = await axios.get(`/api/auth/${provider}/callback?code=${code}`);

    if (res.data.status === 200) {
      router.push(res.data.redirectTo || "/home");
    } else {
      showToast({
        type: res.data.type || "error",
        title: `${provider.toUpperCase()} Login Failed`,
        msg: res.data.msg || "Something went wrong",
      });
    }
  } catch (err) {
    console.error(err);
    showToast({
      type: "error",
      title: `${provider.toUpperCase()} Login Failed`,
      msg: "Server error",
    });
  } finally {
    setLoading(false);
  }
};
