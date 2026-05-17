# B-Brain 診断テスト　セットアップガイド

## ファイル構成

```
project/
├── index.html                    ← 診断テスト本体
├── package.json                  ← npm依存関係
├── SETUP.md                      ← このファイル
└── netlify/
    └── functions/
        └── send-email.js         ← メール送信サーバーレス関数
```

---

## STEP 1：Gmailアプリパスワードの取得

メール送信に使うGmailのアプリパスワードを取得します。

1. Googleアカウント（oyama35.31@gmail.com）にログイン
2. **Googleアカウント管理** → **セキュリティ**
3. **2段階認証プロセス** を有効にする（まだの場合）
4. 同じページ内の **「アプリパスワード」** をクリック
5. アプリ名に「BBrain診断」と入力して **作成**
6. 表示された **16文字のパスワード** をメモしておく

---

## STEP 2：Netlifyにデプロイ

### 方法A：GitHubを使う場合（推奨）

1. GitHubに新しいリポジトリを作成
2. 上記3つのファイルをアップロード
3. [netlify.com](https://netlify.com) でログイン
4. **Add new site → Import an existing project**
5. GitHubリポジトリを選択してデプロイ

### 方法B：ドラッグ＆ドロップ（簡単）

1. [netlify.com](https://netlify.com) でログイン
2. **Sites** → フォルダごとドラッグ＆ドロップ
   ⚠️ この方法では Functions が使えないため、方法Aを推奨

---

## STEP 3：Netlifyで環境変数を設定

1. Netlifyのダッシュボードで該当サイトを開く
2. **Site configuration → Environment variables**
3. 以下の2つを追加：

| 変数名 | 値 |
|---|---|
| `GMAIL_USER` | oyama35.31@gmail.com |
| `GMAIL_APP_PASSWORD` | STEP1で取得した16文字のパスワード |

4. **Save** をクリック
5. **Deploys → Trigger deploy → Deploy site** で再デプロイ

---

## 動作確認

デプロイ完了後、サイトURLにアクセスして診断を最後まで行うと、  
**oyama35.31@gmail.com** に結果メールが届きます。

---

## よくあるトラブル

**メールが届かない場合**
- アプリパスワードが正しくコピーされているか確認
- Netlifyの **Functions** タブでエラーログを確認

**Functionsタブが表示されない**
- 方法Aのデプロイになっているか確認
- `netlify/functions/` フォルダが正しい位置にあるか確認

---

開発者　フロンティア75
