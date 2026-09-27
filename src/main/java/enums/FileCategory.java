package enums;

public enum FileCategory {
    PRODUCT_IMAGE("products"),
    USER_AVATAR("avatars");

    private final String folder;

    FileCategory(String folder) {
        this.folder = folder;
    }

    public String getFolder() {
        return folder;
    }
}
