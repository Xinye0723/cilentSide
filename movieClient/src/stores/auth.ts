import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        memberId: null as string | null,
        token: null as string | null,
        memberName: null as string | null,
    }),
    getters: {
        isLoggedIn: (state) => !!state.token && !!state.memberId,
        // 取得認證標頭
        authHeaders: (state) => ({
            "Content-Type": "application/json",
            "Authorization": state.token ? `Bearer ${state.token}` : "",
        }),
    },
    actions: {
        // 設定登入資訊
        setAuth({ id, token, name }: { id: string; token: string; name?: string }) {
            this.memberId = id;
            this.token = token;
            this.memberName = name || null;

            // 觸發登入狀態變化事件，讓其他組件知道
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('loginStatusChanged'));
            }
        },

        // 清除登入資訊
        clearAuth() {
            this.memberId = null;
            this.token = null;
            this.memberName = null;

            // 觸發登入狀態變化事件
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('loginStatusChanged'));
            }
        },

        // 登出並清除所有狀態
        logout() {
            this.clearAuth();
        },

        // 檢查登入狀態
        checkAuth() {
            return this.isLoggedIn;
        },

        // 從現有 localStorage 初始化 (遷移用，之後可以移除)
        initFromLocalStorage() {
            const memberId = localStorage.getItem("memberId");
            const token = localStorage.getItem("token");
            const memberName = localStorage.getItem("memberName");

            if (memberId && token) {
                this.setAuth({
                    id: memberId,
                    token: token,
                    name: memberName || undefined
                });

                // 清除 localStorage 中的舊資料
                localStorage.removeItem("memberId");
                localStorage.removeItem("token");
                localStorage.removeItem("memberName");
            }
        }
    },
    persist: true,
});